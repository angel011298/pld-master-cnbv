// Thin wrapper for SW SAPiens CFDI 4.0 stamping API.
// Configure via SW_SAPIENS_USER, SW_SAPIENS_PASSWORD, SW_SAPIENS_RFC_EMISOR.

const SW_AUTH_URL = "https://services.sw.com.mx/security/authenticate";
const SW_STAMP_URL = "https://services.sw.com.mx/services/issuev4/cfdi40/stamp";
const SW_CANCEL_URL = "https://services.sw.com.mx/cfdi40/cancel";

type SwConfig = {
  user: string;
  password: string;
  rfcEmisor: string;
  nombreEmisor: string;
  regimenEmisor: string;
};

export function loadSwConfig(): SwConfig {
  const user = process.env.SW_SAPIENS_USER;
  const password = process.env.SW_SAPIENS_PASSWORD;
  const rfcEmisor = process.env.SW_SAPIENS_RFC_EMISOR;
  const nombreEmisor = process.env.SW_SAPIENS_NOMBRE_EMISOR ?? "Certifik PLD";
  const regimenEmisor = process.env.SW_SAPIENS_REGIMEN_EMISOR ?? "601";
  if (!user || !password || !rfcEmisor) {
    throw new Error("SW SAPiens env vars missing (USER/PASSWORD/RFC_EMISOR).");
  }
  return { user, password, rfcEmisor, nombreEmisor, regimenEmisor };
}

export async function swAuthenticate(cfg: SwConfig): Promise<string> {
  const res = await fetch(SW_AUTH_URL, {
    method: "POST",
    headers: {
      user: cfg.user,
      password: cfg.password,
    },
  });
  if (!res.ok) throw new Error(`SW auth failed: ${res.status}`);
  const json = (await res.json()) as { data?: { token?: string } };
  const token = json.data?.token;
  if (!token) throw new Error("SW token ausente.");
  return token;
}

export type CfdiReceptor = {
  rfc: string;
  nombre: string;
  regimenFiscal: string;
  usoCFDI: string;
};

export type CfdiStampInput = {
  receptor: CfdiReceptor;
  subtotal: number;
  iva: number;
  total: number;
  descripcion: string;
};

export async function swStampCfdi(input: CfdiStampInput) {
  const cfg = loadSwConfig();
  const token = await swAuthenticate(cfg);

  const payload = {
    Version: "4.0",
    Serie: "A",
    Folio: `${Date.now()}`,
    Fecha: new Date().toISOString().slice(0, 19),
    FormaPago: "03",
    MetodoPago: "PUE",
    Moneda: "MXN",
    TipoDeComprobante: "I",
    LugarExpedicion: "03100",
    Exportacion: "01",
    SubTotal: input.subtotal.toFixed(2),
    Total: input.total.toFixed(2),
    Emisor: {
      Rfc: cfg.rfcEmisor,
      Nombre: cfg.nombreEmisor,
      RegimenFiscal: cfg.regimenEmisor,
    },
    Receptor: {
      Rfc: input.receptor.rfc,
      Nombre: input.receptor.nombre,
      RegimenFiscalReceptor: input.receptor.regimenFiscal,
      UsoCFDI: input.receptor.usoCFDI,
      DomicilioFiscalReceptor: "00000",
    },
    Conceptos: [
      {
        ClaveProdServ: "81161700",
        Cantidad: "1",
        ClaveUnidad: "E48",
        Descripcion: input.descripcion,
        ValorUnitario: input.subtotal.toFixed(2),
        Importe: input.subtotal.toFixed(2),
        ObjetoImp: "02",
        Impuestos: {
          Traslados: [
            {
              Base: input.subtotal.toFixed(2),
              Impuesto: "002",
              TipoFactor: "Tasa",
              TasaOCuota: "0.160000",
              Importe: input.iva.toFixed(2),
            },
          ],
        },
      },
    ],
  };

  const res = await fetch(SW_STAMP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/jsontoxml",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as {
    status?: string;
    data?: {
      uuid?: string;
      cfdi?: string;
      fechaTimbrado?: string;
    };
    message?: string;
    messageDetail?: string;
  };

  if (json.status !== "success" || !json.data?.uuid) {
    throw new Error(`SW stamp error: ${json.message ?? "desconocido"}`);
  }

  return {
    uuid: json.data.uuid,
    xml: json.data.cfdi ?? "",
    fechaTimbrado: json.data.fechaTimbrado ?? new Date().toISOString(),
  };
}

export async function swCancelCfdi(uuid: string, motivo: string) {
  const cfg = loadSwConfig();
  const token = await swAuthenticate(cfg);
  const res = await fetch(`${SW_CANCEL_URL}/${cfg.rfcEmisor}/${uuid}/${motivo}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`SW cancel failed: ${res.status}`);
  return (await res.json()) as { status: string; data?: unknown };
}
