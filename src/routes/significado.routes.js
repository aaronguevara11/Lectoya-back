import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.post("/agregarSignificado", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const {lectura, idTema} = req.body;

        const temaExiste = await prisma.temas.findUnique({
          where: {
            id: Number(idTema),
          },
        });

        if (!temaExiste) {
          res.status(404).json({
            message: "El tema no existe",
          });
          return
        }

        const dado = await prisma.dale_significado.create({
          data: {
            lectura: lectura
          },
        });

        await prisma.juegos.create({
          data: {
            idTema: Number(idTema),
            nombreJuego: "Dale un significado",
            idJuego: dado.id,
          },
        });

        res.json({
          message: "El juego fue agregado con exito",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

router.post("/respuestaSignificado", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const {palabra1, palabra2, palabra3, significado1, significado2, significado3, id} = req.body;
        const idAlumno = payload.id;
        const nombre = payload.nombre;
        const apellido = payload.apaterno;
        
        const rj = await prisma.juegos.findUnique({
          where: {
            id: Number(id),
          },
          select: {
            nombreJuego: true,
            idJuego: true,
          },
        });

        if (!rj) {
          res.status(404).json({
            message: "El juego no existe o ha sido borrado",
          });
          return;
        }

        if (rj.nombreJuego === "Dale un significado") {
          await prisma.res_significado.create({
            data: {
              idDale: Number(rj.idJuego),
              palabra1: palabra1,
              palabra2: palabra2,
              palabra3: palabra3,
              significado1: significado1,
              significado2: significado2,
              significado3: significado3,
              idAlumno: Number(idAlumno),
              nombre: nombre,
              apaterno: apellido,
            },
          });
          res.json({
            message: "Respuesta enviada",
          });
        } else {
          res.status(404).json({
            message: "No se encontro el juego",
          });
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

export default router;
