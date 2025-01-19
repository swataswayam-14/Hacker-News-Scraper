import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';

const router = express.Router();
const swaggerDocument = yaml.load(path.resolve('src/docs/swagger.yml'));

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export const docsRoutes = router;
