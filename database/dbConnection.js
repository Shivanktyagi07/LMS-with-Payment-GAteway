import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000;

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    //mongoose configuration settings:
    mongoose.set("strictQuery", true);

    //Hanlde events connection settings:
    mongoose.connection.on("connected", () => {
      console.log("Database Connected without any error! ENJOY,,,");
      this.isConnected = true;
    });

    mongoose.connection.on("disconnected", () => {
      conslole.log("Database Disconnected ! SHITTTTT....");
      this.isConnected = false;
      this.handleDisconnection();
    });

    mongoose.connection.on("error", () => {
      console.log("Database Connection Error ! Try Again...", err);
      this.isConnected = false;
    });

    // Handle app termination
    process.on("SIGINT", this.handleAppTermination.bind(this));
    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connect() {
    try {
      if (!process.env.MONGODB_URI) {
        throw new error("MongoDB URI isn't defined in env file !..");
      }

      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0; // Reset retry count on successful connection
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err.message);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`,
      );

      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL)); // Wait some seconds before retrying
      return this.connect();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts`,
      );
      process.exit(1); //Stop the server because database is unavailable
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      console.log("Tring to reconnect the MongoDB !");
      this.connect();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error during database disconnection:", err);
      process.exit(1);
    }
  }

  //Get current status:
  getConnectionStatus() {
    return {
      isConnected: this.isConnected(),
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

const dbConnection = new DatabaseConnection();

// Export the connect function and the instance
export default dbConnection.connect.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
