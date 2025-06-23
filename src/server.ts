import createApp from './app';
import { defaultDataSource } from './database/typeorm/data-source';

const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

let server: http.Server;

const startServer = async () => {
    try {
        const app = await createApp();

        server = app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
            console.log(`🔌 Database connection state: ${defaultDataSource.isInitialized ? 'Initialized' : 'Not Initialized'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        if (defaultDataSource?.isInitialized) {
            await defaultDataSource.destroy().catch(err => console.error('Error destroying datasource during startup failure:', err));
        }
        process.exit(1);
    }
};

const gracefulShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    // 1. Stop accepting new connections
    if (server) {
        console.log('⏳ Closing HTTP server...');
        server.close(async (err) => {
            if (err) {
                console.error('❌ Error closing HTTP server:', err);
                // Potentially force exit if server closing fails critically
                // process.exit(1); // Be cautious with forcing exit here
            } else {
                console.log('✅ HTTP server closed.');
            }

            // 2. Close database connection (regardless of server close error)
            if (defaultDataSource?.isInitialized) {
                try {
                    console.log('⏳ Closing database connection...');
                    await defaultDataSource.destroy();
                    console.log('✅ Database connection closed.');
                } catch (dbErr) {
                    console.error('❌ Error closing database connection:', dbErr);
                    process.exitCode = 1;
                }
            } else {
                console.log('ℹ️ Database connection was not initialized, skipping close.');
            }

            if (redisClient !== undefined) {
                console.log('⏳ Closing redis client connection...');
                await redisClient.quit();
                console.log('✅ Redis client connection closed.');
            } else {
                console.log('ℹ️ Redis client connection was not initialized, skipping close.');
            }

            // 3. Exit process
            console.log('🏁 Shutdown complete.');
            process.exit(process.exitCode || 0); // Exit with stored code or 0 if success
        });

        // Force shutdown after a timeout if graceful shutdown hangs
        const shutdownTimeout = 10000; // 10 seconds
        setTimeout(() => {
            console.error(`⏰ Graceful shutdown timed out after ${shutdownTimeout}ms. Forcing exit.`);
            process.exit(1);
        }, shutdownTimeout);

    } else {
        // If server hasn't started, just try closing DB if needed and exit
        console.log('ℹ️ Server was not running. Closing resources if possible.');
        if (defaultDataSource?.isInitialized) {
            try {
                await defaultDataSource.destroy();
                console.log('✅ Database connection closed.');
            } catch (dbErr) {
                console.error('❌ Error closing database connection:', dbErr);
                process.exit(1);
            }
        }
        process.exit(0); // Exit cleanly as server wasn't running
    }
};

// Listen for interrupt signal (Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Listen for termination signal (e.g., from Docker, Kubernetes, systemd)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
startServer();
