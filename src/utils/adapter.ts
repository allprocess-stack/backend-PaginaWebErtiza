type DBType = "postgres" | "mysql" | "sqlserver";

export const formatQuery = (dbType: DBType, query: string) => {
  if (dbType === "postgres") {
    let i = 0;
    return query.replace(/\?/g, () => `$${++i}`);
  }

  if (dbType === "sqlserver") {
    let i = 0;
    return query.replace(/\?/g, () => `@p${++i}`);
  }

  // mysql se queda con ?
  return query;
};