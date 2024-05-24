import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

router.post("/matricularAlumno", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      console.log(payload);
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idCurso } = req.body;
        // Verifica si el curso existe
        const curso = await prisma.cursos.findUnique({
          where: { id: Number(idCurso) },
        });
        if (!curso) {
          return res.status(404).json({
            message: "El curso no existe",
          });
        }
        // Verifica si el alumno ya está matriculado en el curso
        const matriculas = await prisma.matriculas.findMany({
          where: {
            idAlumno: Number(payload.id),
            idCurso: Number(idCurso),
          },
        });

        if (matriculas.length > 0) {
          return res.json({
            message: "El alumno ya está matriculado en este curso",
          });
        }

        // Matricula al alumno
        await prisma.matriculas.create({
          data: {
            idCurso: Number(idCurso),
            idAlumno: Number(payload.id),
          },
        });
        res.json({
          message: "Alumno matriculado con éxito",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.delete("/borrarMatricula", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;
        await prisma.matriculas.delete({
          where: { id: Number(id) },
        });
        res.json({
          message: "La matricula ha sido borrada con exito",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.get("/genLink/:idCurso", async (req, res) => {
  try {
    const curso = req.params.idCurso;

    const payload = {
      curso,
    };

    const token = jwt.sign(payload, process.env.KEY_LINK, {
      expiresIn: 3600,
    });

    res.json({
      message: "Link generado con éxito",
      url: "http://localhost:5173/validar/" + token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.put("/validarLink", async (req, res) => {
  try {
    const { correo, password, token } = req.body;
    const respuesta = await prisma.alumnos.findUnique({
      where: {
        correo,
        password,
      },
    });
    if (respuesta == null) {
      res.json({
        message: "Datos incorrectos",
      });
    } else {
      jwt.verify(token, process.env.KEY_LINK, async (err, payload) => {
        if (err) {
          res.json({
            message: "Error en el token",
          });
        } else {
          const { curso } = payload;
          console.log(curso);
          const matriculas = await prisma.matriculas.findMany({
            where: {
              idAlumno: Number(respuesta.id),
              idCurso: Number(curso),
            },
          });

          console.log(matriculas);

          if (matriculas.length > 0) {
            return res.json({
              message: "El alumno ya está matriculado en este curso",
            });
          }

          // Matricula al alumno
          await prisma.matriculas.create({
            data: {
              idCurso: Number(curso),
              idAlumno: Number(respuesta.id),
            },
          });
          res.json({
            message: "Alumno matriculado con éxito",
          });
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

export default router;
