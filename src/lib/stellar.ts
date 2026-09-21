/**
 * MOXOTORO — Integración con Stellar Network (Horizon API & SDK)
 * Ecosistema Stellar para el Argentina Builder Challenge
 */

import { Horizon } from "@stellar/stellar-sdk";
import { MOXOTORO_CONFIG } from "@/config/moxotoro.config";

export function getHorizonServer(): Horizon.Server {
  return new Horizon.Server(MOXOTORO_CONFIG.stellar.horizonUrl);
}

/**
 * Genera el enlace estándar SEP-0007 para pagos móviles (compatible con LOBSTR y billeteras Stellar)
 */
export function generateSep0007Uri(params: {
  amountUsdc: number;
  memo: string;
}): string {
  const dest = MOXOTORO_CONFIG.stellar.receiverPublicKey;
  const asset = MOXOTORO_CONFIG.stellar.assetCode;
  return `web+stellar:pay?destination=${dest}&amount=${params.amountUsdc.toFixed(2)}&asset_code=${asset}&memo=${encodeURIComponent(params.memo)}&memo_type=MEMO_TEXT`;
}

export interface VerificationResult {
  verified: boolean;
  txHash?: string;
  amount?: string;
  sourceAccount?: string;
  timestamp?: string;
  message: string;
}

/**
 * Consulta la red Horizon para verificar si existe una transacción acreditada con el MEMO dado
 */
export async function verifyTransactionByMemo(memoId: string): Promise<VerificationResult> {
  const server = getHorizonServer();
  const receiverAccount = MOXOTORO_CONFIG.stellar.receiverPublicKey;

  try {
    const payments = await server
      .payments()
      .forAccount(receiverAccount)
      .order("desc")
      .limit(20)
      .call();

    for (const record of payments.records) {
      if (record.type === "payment") {
        const tx = await record.transaction();
        if (tx.memo === memoId) {
          return {
            verified: true,
            txHash: record.transaction_hash,
            amount: (record as { amount?: string }).amount,
            sourceAccount: (record as { from?: string }).from,
            timestamp: record.created_at,
            message: "Transacción verificada exitosamente on-chain en Stellar Network",
          };
        }
      }
    }

    return {
      verified: false,
      message: "No se detectó aún la transacción con el identificador de seña en el ledger.",
    };
  } catch (error) {
    // Si la cuenta de prueba no está activa aún en Horizon o hay error de red, devolvemos resultado estructurado
    return {
      verified: false,
      message: error instanceof Error ? error.message : "Error al consultar Stellar Horizon",
    };
  }
}
