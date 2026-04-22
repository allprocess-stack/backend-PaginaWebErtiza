import { getActiveType, getDynamicPool } from "./dbDynamic";

export const executeQuery = async (query: string, params: any[]) => {
  const pool = getDynamicPool();
  const dbType = getActiveType();

  if (!pool) {
    throw new Error("No hay conexión activa a la base de datos");
  }

  switch (dbType) {
    case "POSTGRES":
    case "POSTGRESQL":
      return await pool.query(convertPlaceholders(query, dbType), params);

    case "MYSQL":
      const [rows] = await pool.query(query, params);
      return { rows };

    case "SQLSERVER":
      const request = pool.request();
      params.forEach((p, i) => {
        request.input(`p${i + 1}`, p);
      });

      const result = await request.query(convertPlaceholders(query, dbType));
      return { rows: result.recordset };

    default:
      throw new Error("Motor no soportado");
  }
};
export const convertPlaceholders = (query: string, dbType: string) => {
  let i = 0;

  if (dbType === "POSTGRES" || dbType === "POSTGRESQL") {
    return query.replace(/\?/g, () => `$${++i}`);
  }

  if (dbType === "SQLSERVER") {
    return query.replace(/\?/g, () => `@p${++i}`);
  }

  return query; // MySQL usa ?
};