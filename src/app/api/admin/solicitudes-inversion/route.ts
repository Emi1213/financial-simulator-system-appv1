import { NextResponse } from "next/server";
import { query } from "@/lib/database";

/* ================================
   GET - Obtener todas las solicitudes de inversión
================================ */
export async function GET() {
  try {
    const solicitudes = await query(
      `SELECT 
        si.id_solicitud,
        si.monto,
        si.plazo_meses,
        si.ingresos,
        si.egresos,
        si.empresa,
        si.ruc,
        si.tipo_empleo,
        si.documento_validacion_uri,
        si.estado,
        si.observacion_admin,
        si.fecha_solicitud,
        u.usuario AS nombre_usuario,
        u.cedula,
        i.nombre AS nombre_inversion,
        i.tasa_anual,
        -- cálculo simple de ganancia estimada
        ROUND(si.monto * (i.tasa_anual / 100) * (si.plazo_meses / 12), 2) AS ganancia_estimada
      FROM solicitud_inversion si
      INNER JOIN usuarios u ON si.id_usuario = u.id
      INNER JOIN inversiones i ON si.id_inversion = i.id
      ORDER BY si.fecha_solicitud DESC`
    );

    const solicitudesArray = Array.isArray(solicitudes) ? solicitudes : [];
    const solicitudesFormateadas = solicitudesArray.map((solicitud: any) => ({
      ...solicitud,
      monto: Number(solicitud.monto) || 0,
      plazo_meses: Number(solicitud.plazo_meses) || 0,
      ingresos: Number(solicitud.ingresos) || 0,
      egresos: Number(solicitud.egresos) || 0,
      tasa_anual: Number(solicitud.tasa_anual) || 0,
      ganancia_estimada: Number(solicitud.ganancia_estimada) || 0,
    }));

    return NextResponse.json(solicitudesFormateadas);
  } catch (error: any) {
    console.error("Error obteniendo solicitudes:", error);
    return NextResponse.json(
      { error: "Error interno: " + error.message },
      { status: 500 }
    );
  }
}

/* ================================
   POST - Gestionar solicitud (aprobar o rechazar)
================================ */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idSolicitud, nuevoEstado, observacion } = body;

    // Validación básica
    if (!idSolicitud || !nuevoEstado) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Solo se aceptan los valores reales de tu ENUM ('Aprobado', 'Rechazado')
    if (!["Aprobado", "Rechazado"].includes(nuevoEstado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    await query(
      `UPDATE solicitud_inversion
       SET estado = $1, observacion_admin = $2
       WHERE id_solicitud = $3`,
      [nuevoEstado, observacion || "", idSolicitud]
    );

    return NextResponse.json({
      message: `Solicitud ${nuevoEstado.toLowerCase()} exitosamente`,
    });
  } catch (error: any) {
    console.error("Error al gestionar solicitud:", error);
    return NextResponse.json(
      { error: "Error interno: " + error.message },
      { status: 500 }
    );
  }
}
