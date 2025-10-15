import { NextResponse } from "next/server";
import { query } from "@/lib/database";

interface DatabaseLoan {
  id_credito: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  interes: number;
  plazo_min: number;
  plazo_max: number;
  informacion: string;
  estado: number;
  id_indirecto: number | null;
  nombre_indirecto: string | null;
  tipo_indirecto: string | null;
  interes_indirecto: number | null;
  tipo_interes_indirecto: string | null;
}

/**
 * 🟩 GET - Obtener todos los créditos con sus cobros indirectos
 */
export async function GET() {
  try {
    const sql = `
      SELECT 
        c.id_credito, 
        c.nombre, 
        c.descripcion, 
        c.tipo, 
        c.interes,
        c.plazo_min, 
        c.plazo_max,
        c.informacion, 
        c.estado,
        i.id_indirecto, 
        i.nombre AS nombre_indirecto, 
        i.tipo AS tipo_indirecto,
        i.interes AS interes_indirecto, 
        i.tipo_interes AS tipo_interes_indirecto
      FROM creditostabla c
      LEFT JOIN credito_indirecto ci ON c.id_credito = ci.id_credito
      LEFT JOIN indirect i ON ci.id_indirecto = i.id_indirecto
      ORDER BY c.id_credito DESC
    `;

    const results = (await query(sql)) as DatabaseLoan[];

    // Agrupar créditos con sus cobros
    const grouped = Object.values(
      results.reduce((acc: any, row) => {
        if (!acc[row.id_credito]) {
          acc[row.id_credito] = {
            id_credito: row.id_credito,
            nombre: row.nombre,
            descripcion: row.descripcion,
            tipo: row.tipo,
            interes: row.interes,
            plazo_min: row.plazo_min,
            plazo_max: row.plazo_max,
            informacion: row.informacion,
            estado: Boolean(row.estado), // El campo ya es boolean en PostgreSQL
            cobros_indirectos: [],
          };
        }
        if (row.id_indirecto != null && row.nombre_indirecto) {
          acc[row.id_credito].cobros_indirectos.push({
            id_indirecto: row.id_indirecto,
            nombre: row.nombre_indirecto,
            tipo: row.tipo_indirecto,
            interes: row.interes_indirecto,
            tipo_interes: row.tipo_interes_indirecto,
          });
        }
        return acc;
      }, {})
    );

    return NextResponse.json(grouped);
  } catch (error: any) {
    console.error("❌ Error al obtener créditos:", error);
    return NextResponse.json(
      { error: "Error al cargar los créditos: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * 🟩 GET - Obtener cobros indirectos tipo “directo”
 */
export async function GET_INDIRECTS() {
  try {
    const sql = `SELECT * FROM indirect WHERE tipo = 'directo' ORDER BY nombre ASC`;
    const results = (await query(sql)) as any[];
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("❌ Error al obtener cobros indirectos:", error);
    return NextResponse.json(
      { error: "Error al cargar cobros indirectos" },
      { status: 500 }
    );
  }
}

/**
 * 🟦 POST - Crear un crédito con cobros indirectos
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.nombre || !data.tipo || data.interes === undefined) {
      return NextResponse.json(
        { error: "Nombre, tipo e interés son requeridos" },
        { status: 400 }
      );
    }

    const sqlCredito = `
      INSERT INTO creditostabla 
        (nombre, descripcion, tipo, interes, plazo_min, plazo_max, informacion, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_credito
    `;

    const result = (await query(sqlCredito, [
      data.nombre,
      data.descripcion || "",
      data.tipo,
      Number(data.interes), // Asegurar que sea número
      Number(data.plazo_min || 1), // Asegurar que sea número
      Number(data.plazo_max || 12), // Asegurar que sea número
      data.informacion || "",
      Boolean(data.estado === 1 || data.estado === true), // Convertir a boolean para PostgreSQL
    ])) as any;

    const id_credito = result.rows?.[0]?.id_credito || result[0]?.id_credito;

    // Insertar cobros indirectos solo si hay IDs válidos
    if (
      Array.isArray(data.cobros_indirectos) &&
      data.cobros_indirectos.length > 0
    ) {
      for (const id_indirecto of data.cobros_indirectos) {
        if (id_indirecto != null) {
          // Insertar cobros indirectos (si ya existe, no hay problema)
          try {
            await query(
              "INSERT INTO credito_indirecto (id_credito, id_indirecto) VALUES ($1, $2)",
              [id_credito, id_indirecto]
            );
          } catch (insertError: any) {
            // Si ya existe la relación, continuar sin error
            if (!insertError.message.includes('duplicate key')) {
              throw insertError;
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, id_credito });
  } catch (error: any) {
    console.error("❌ Error al crear crédito:", error);
    return NextResponse.json(
      { error: "Error al crear el crédito: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * 🟨 PUT - Actualizar crédito y cobros indirectos
 */
export async function PUT(request: Request) {
  try {
    const data = await request.json();

    if (!data.id_credito)
      return NextResponse.json(
        { error: "ID del crédito es requerido" },
        { status: 400 }
      );
    if (!data.nombre || !data.tipo || data.interes === undefined)
      return NextResponse.json(
        { error: "Nombre, tipo e interés son requeridos" },
        { status: 400 }
      );

    // Actualizar información principal
    const sql = `
      UPDATE creditostabla SET 
        nombre = $1, descripcion = $2, tipo = $3, interes = $4, 
        plazo_min = $5, plazo_max = $6, informacion = $7, estado = $8
      WHERE id_credito = $9
    `;

    await query(sql, [
      data.nombre,
      data.descripcion || "",
      data.tipo,
      Number(data.interes), // Asegurar que sea número
      Number(data.plazo_min || 1), // Asegurar que sea número
      Number(data.plazo_max || 12), // Asegurar que sea número
      data.informacion || "",
      Boolean(data.estado === 1 || data.estado === true), // Convertir a boolean para PostgreSQL
      Number(data.id_credito), // Asegurar que el ID sea número
    ]);

    // Actualizar cobros indirectos solo si el array está definido
    if (Array.isArray(data.cobros_indirectos)) {
      await query("DELETE FROM credito_indirecto WHERE id_credito = $1", [
        data.id_credito,
      ]);
      for (const id_indirecto of data.cobros_indirectos) {
        if (id_indirecto != null) {
          // Insertar cobros indirectos (si ya existe, no hay problema)
          try {
            await query(
              "INSERT INTO credito_indirecto (id_credito, id_indirecto) VALUES ($1, $2)",
              [data.id_credito, id_indirecto]
            );
          } catch (insertError: any) {
            // Si ya existe la relación, continuar sin error
            if (!insertError.message.includes('duplicate key')) {
              throw insertError;
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error al actualizar crédito:", error);
    return NextResponse.json(
      { error: "Error al actualizar el crédito: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * 🟥 DELETE - Eliminar crédito y cobros asociados
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_credito = searchParams.get("id");
    if (!id_credito)
      return NextResponse.json(
        { error: "ID del crédito es requerido" },
        { status: 400 }
      );

    await query("DELETE FROM credito_indirecto WHERE id_credito = $1", [
      id_credito,
    ]);
    await query("DELETE FROM creditostabla WHERE id_credito = $1", [id_credito]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error al eliminar crédito:", error);
    return NextResponse.json(
      { error: "Error al eliminar el crédito: " + error.message },
      { status: 500 }
    );
  }
}
