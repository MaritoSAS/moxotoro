/**
 * MOXOTORO — Integración con Stellar Network (Horizon API & SDK)
 * Seña en USDC de Testnet (emisor Circle), verificable en Horizon.
 * Nunca incluir secretos: solo claves públicas.
 */

import { Horizon } from "@stellar/stellar-sdk";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";

const AMOUNT_TOLERANCE_USDC = 0.01;

type ListedPayment = Awaited<
  ReturnType<ReturnType<Horizon.Server["payments"]>["call"]>
>["records"][number];

type CreditDelivery =
  | Horizon.ServerApi.PaymentOperationRecord
  | Horizon.ServerApi.PathPaymentOperationRecord
  | Horizon.ServerApi.PathPaymentStrictSendOperationRecord;

export function getHorizonServer(): Horizon.Server {
  return new Horizon.Server(MOXOTORO_CONFIG.stellar.horizonUrl);
}

/**
 * Enlace SEP-0007 para pagar la seña en USDC (LOBSTR, Freighter y otras billeteras).
 * Incluye `asset_issuer` para que la billetera no envíe XLM ni otro USDC.
 */
export function generateSep0007Uri(params: {
  amountUsdc: number;
  memo: string;
}): string {
  const { receiverPublicKey, assetCode, assetIssuer } = MOXOTORO_CONFIG.stellar;
  const query = new URLSearchParams({
    destination: receiverPublicKey,
    amount: params.amountUsdc.toFixed(2),
    asset_code: assetCode,
    asset_issuer: assetIssuer,
    memo: params.memo,
    memo_type: "MEMO_TEXT",
  });
  return `web+stellar:pay?${query.toString()}`;
}

export function stellarExpertTxUrl(txHash: string): string {
  const network = MOXOTORO_CONFIG.stellar.network === "PUBLIC" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
}

export interface VerificationResult {
  verified: boolean;
  txHash?: string;
  amount?: string;
  sourceAccount?: string;
  timestamp?: string;
  message: string;
}

function isCreditDelivery(record: ListedPayment): record is CreditDelivery {
  return (
    record.type === "payment" ||
    record.type === "path_payment_strict_receive" ||
    record.type === "path_payment_strict_send"
  );
}

function isConfiguredUsdc(record: CreditDelivery): boolean {
  const { assetCode, assetIssuer } = MOXOTORO_CONFIG.stellar;
  const isCredit =
    record.asset_type === "credit_alphanum4" || record.asset_type === "credit_alphanum12";
  return isCredit && record.asset_code === assetCode && record.asset_issuer === assetIssuer;
}

function amountsMatch(paidAmount: string, expectedAmountUsdc: number): boolean {
  const paid = Number(paidAmount);
  if (!Number.isFinite(paid)) return false;
  return Math.abs(paid - expectedAmountUsdc) <= AMOUNT_TOLERANCE_USDC;
}

/**
 * Busca en Horizon un pago acreditado con el memo de la seña.
 * Exige memo de texto, destino = cuenta receptora y USDC del emisor configurado (no XLM).
 * Si se pasa `expectedAmountUsdc`, el monto debe coincidir dentro de 0.01 USDC.
 */
export async function verifyTransactionByMemo(
  memoId: string,
  expectedAmountUsdc?: number,
): Promise<VerificationResult> {
  const server = getHorizonServer();
  const receiverAccount = MOXOTORO_CONFIG.stellar.receiverPublicKey;

  try {
    const payments = await server
      .payments()
      .forAccount(receiverAccount)
      .order("desc")
      .limit(200)
      .call();

    let sawAmountMismatch = false;

    for (const record of payments.records) {
      if (!isCreditDelivery(record)) continue;
      if (!record.transaction_successful) continue;
      if (record.to !== receiverAccount) continue;
      if (!isConfiguredUsdc(record)) continue;

      const tx = await record.transaction();
      if (tx.memo_type !== "text" || tx.memo !== memoId) continue;

      if (
        expectedAmountUsdc !== undefined &&
        !amountsMatch(record.amount, expectedAmountUsdc)
      ) {
        sawAmountMismatch = true;
        continue;
      }

      return {
        verified: true,
        txHash: record.transaction_hash,
        amount: record.amount,
        sourceAccount: record.from,
        timestamp: record.created_at,
        message: "Seña verificada en Horizon testnet.",
      };
    }

    if (sawAmountMismatch && expectedAmountUsdc !== undefined) {
      return {
        verified: false,
        message: `Hay un pago USDC con ese memo, pero el monto no coincide con la seña de ${expectedAmountUsdc.toFixed(2)} USDC.`,
      };
    }

    return {
      verified: false,
      message: "No se detectó aún la transacción con el identificador de seña en el ledger.",
    };
  } catch (error) {
    const status =
      error &&
      typeof error === "object" &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response?.status === "number"
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 404) {
      return {
        verified: false,
        message:
          "La cuenta receptora todavía no aparece en Horizon testnet. Fondeala con Friendbot y reintentá.",
      };
    }

    return {
      verified: false,
      message: error instanceof Error ? error.message : "Error al consultar Stellar Horizon",
    };
  }
}
