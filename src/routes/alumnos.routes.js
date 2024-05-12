import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

// Registrar nuevos alumnos
router.post("/registrarAlumnos", async (req, res) => {
  try {
    const { nombre, apaterno, amaterno, correo, numero, dni, password } =
      req.body;

    const alumno = await prisma.alumnos.findUnique({
      where: {
        dni: dni,
      },
    });

    if (alumno) {
      res.json({
        message: "El alumno ya existe",
      });
      return;
    }

    await prisma.alumnos.create({
      data: {
        nombre: nombre,
        apaterno: apaterno,
        amaterno: amaterno,
        correo: correo,
        dni: dni,
        password: password,
        numero: numero,
      },
    });
    console.log("Alumno registrado");
    res.json({
      message: "Alumno registrado con éxito",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

//Actualizar datos de los alumnos
router.put("/actualizarAlumnos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const {
          id,
          nombre,
          apaterno,
          amaterno,
          correo,
          numero,
        } = req.body;

        const alumno = await prisma.alumnos.findUnique({
          where: { id: Number(id) },
        });

        if (!alumno) {
          res.status(404).json({
            message: "El alumno no existe",
          });
          return;
        }

        await prisma.alumnos.update({
          where: { id: Number(id) },
          data: {
            nombre: nombre,
            apaterno: apaterno,
            amaterno: amaterno,
            correo: correo,
            numero: numero,
          },
        });

        res.json({
          message: "Información del Alumno actualizada correctamente.",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});



//Iniciar sesion
router.put("/loginAlumnos", async (req, res) => {
  try {
    const { correo = null, password = null } = req.body;
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
      const token = jwt.sign(respuesta, process.env.JWT_KEY, {
        expiresIn: 7200,
      });
      res.json({
        message: "Loggeo exitoso",
        token,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

//Restablecer contraseña del alumno
router.put("/alumnoRestablecer", async (req, res) => {
  try {
    const { dni, correo, newPassword } = req.body;
    const res1 = await prisma.alumnos.count({
      where: {
        correo: correo,
      },
    });
    if (res1 == 1) {
      await prisma.alumnos.update({
        where: {
          dni: dni,
          correo: correo,
        },
        data: {
          password: newPassword,
        },
      });
      res.json({
        message: "Contraseña actualizada con exito",
      });
    } else {
      res.status(404).json({
        message: "Datos no encontrados",
      });
      return
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

export default router;
