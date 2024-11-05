import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import SlotController from "./routes/SlotController";
import SlotRouterFactory from "./routes/SlotRouterFactory";
import SlotGameUseCase from './application/use-cases/SlotGameUseCase';
import WalletService from "./application/services/WalletService";
import WalletController from "./routes/WalletController";
import WalletRouterFactory from "./routes/WalletRouterFactory";
import Player from "./domain/Player"; 

// Create an instance of Player
const player = new Player();

// After the project is started it will reset the balance of the player 
player.resetBalance(1000);

// Initialize service and controller with the Player instance
const walletService = new WalletService(player);
const walletController = new WalletController(walletService);

// Initialize router factory with the controller
const walletRouterFactory = new WalletRouterFactory(walletController);

// Initialize service and controller
const slotService = new SlotGameUseCase(walletService);
const slotController = new SlotController(slotService);

// Initialize router factory with the controller
const slotRouterFactory = new SlotRouterFactory(slotController);

// Initialize the express
const app = express();
app.use(express.json());

// Use the router created by the factory
app.use(walletRouterFactory.createRouter());

// Use the router created by the factory
app.use(slotRouterFactory.createRouter());

// Load the Swagger document
const swaggerDocument = YAML.load('app/docs/index.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Swagger docs available at http://localhost:3000/api-docs');
});
