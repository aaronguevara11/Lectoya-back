import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

//Registrar docentes:
router.post("/registrarDocentes", async (req, res) => {
  try {
    const { nombre, apaterno, amaterno, correo, numero, dni, password } =
      req.body;

    const docente = await prisma.docente.findUnique({
      where: {
        dni: dni,
      },
    });

    if (docente) {
      res.json({
        message: "El docente ya existe",
      });
      return;
    }

    await prisma.docente.create({
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

    console.log("Docente registrado");
    res.json({
      message: "Docente registrado con éxito",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

//Actualizar docentes:
router.put("/actualizarDocentes", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { nombre, apaterno, amaterno, correo, numero } = req.body;

        const up = await prisma.docente.update({
          where: { 
            id: Number(payload.id) 
          },
          data: {
            nombre: nombre,
            apaterno: apaterno,
            amaterno: amaterno,
            correo: correo,
            numero: numero,
          },
        });

        res.json({
          message: "Docente actualizado",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

//Iniciar sesion:
router.put("/loginDocentes", async (req, res) => {
  try {
    const { correo = null, password = null } = req.body;
    const respuesta = await prisma.docente.findUnique({
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

router.put("/passwordDocente", async (req, res) => {
  try {
    const { correo, dni, newPassword } = req.body;
    const res1 = await prisma.docente.count({
      where: {
        correo: correo,
        dni: dni,
      },
    });
    //  Validar si el usuario existe
    if (res1 == 1) {
      //  Reestablecer contraseña
      await prisma.docente.update({
        where: {
          correo: correo,
          dni: dni,
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
