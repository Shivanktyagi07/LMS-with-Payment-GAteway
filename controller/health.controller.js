import { getDBStatus } from "../database/dbConnection.js";

export const HealthCheck = async (req, res) => {
  try {
    const dbStatus = getDBStatus();

    const healthStatus = {
      status: "OK",
      timestamps: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.isConnected ? "healthy" : "unhealthy",
          details: {
            ...dbStatus,
            readyState: getReadyStateText(dbStatus.readyState),
          },
        },
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      },
    };

    const httpStatus =
      healthStatus.services.database.status === "healthy" ? 200 : 503;
    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    console.error("Health check is failed!..", err);
    res.status(500).json({
      status: "ERROR",
      timestamps: new Date().toISOString(),
      error: error.message,
    });
  }
};

function getReadyStateText(state) {
  switch (state) {
    case 0:
      "disconnected";
    case 1:
      "connected";
    case 2:
      "connecting";
    case 3:
      "disconnected";

    default:
      return "unkown";
  }
}
