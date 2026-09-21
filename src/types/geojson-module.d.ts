declare module "*.geojson" {
  const value: {
    type: string;
    name?: string;
    metadata?: Record<string, unknown>;
    features: Array<{
      type: string;
      properties: Record<string, unknown> & {
        id?: string;
        order?: number;
        name?: string;
        subtitle?: string;
        description?: string;
        duration?: string;
        elevation?: string;
        image?: string;
        isComplementary?: boolean;
        type?: string;
      };
      geometry: {
        type: string;
        coordinates: number[] | number[][];
      };
    }>;
  };
  export default value;
}
