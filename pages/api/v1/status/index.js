import database from "infra/database.js";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    // Query PostgreSQL version
    const versionResult = await database.query("SHOW server_version;");
    const version = versionResult.rows[0].server_version;
    console.log("PostgreSQL Version:", version);

    // Query the maximum allowed connections
    const maxConnectionsResult = await database.query("SHOW max_connections;");
    const maxConnections = maxConnectionsResult.rows[0].max_connections;
    console.log("Max Connections Allowed:", maxConnections);

    // Query the opened connections
    const databaseName = process.env.POSTGRES_DB;
    const openConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const openConnections = openConnectionsResult.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: version,
          max_connections: parseInt(maxConnections),
          opened_connections: openConnections,
        },
      },
    });
  } catch (error) {
    console.error("Something got wrong:", error);
  }
}

export default status;
