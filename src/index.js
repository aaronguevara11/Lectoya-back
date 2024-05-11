import express from "express";
import cors from "cors";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import cursosRoutes from "./routes/cursos.routes.js";
import temasRoutes from "./routes/temas.routes.js";
import matriculasRoutes from "./routes/matriculas.routes.js";
import juegosRoutes from "./routes/juegos.routes.js";
import interactivasRoutes from "./routes/interactivas.routes.js";
import haremosRoutes from "./routes/haremos.routes.js";
import dadoRoutes from "./routes/dado.routes.js";
import cambialoRoutes from "./routes/cambialo.routes.js";
import ordenaloRoutes from "./routes/ordenalo.routes.js";
import ruletaRoutes from "./routes/ruleta.routes.js"
import significadoRoutes from "./routes/significado.routes.js"

const app = express();

app.use(express.json());

app.use(cors());

app.use("/app", alumnosRoutes);
app.use("/app", docentesRoutes);
app.use("/app", cursosRoutes);
app.use("/app", temasRoutes);
app.use("/app", matriculasRoutes);
app.use("/app/juegos", juegosRoutes);
app.use("/app/interactivas", interactivasRoutes);
app.use("/app/haremos", haremosRoutes);
app.use("/app/dado", dadoRoutes);
app.use("/app/cambialo", cambialoRoutes);
app.use("/app/ordenalo", ordenaloRoutes);
app.use("/app/ruleta", ruletaRoutes)
app.use("/app/significado", significadoRoutes)

app.listen(3000);
console.log("Server on port", 3000);
