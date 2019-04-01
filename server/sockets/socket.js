const { io } = require("../server");
const { Usuarios } = require("../classes/usuarios");
const { crearMensaje } = require("../utils/utils");

const usuarios = new Usuarios();
io.on("connection", client => {
  client.on("entrarChat", (data, callback) => {
    if (!data.nombre || !data.sala) {
      return callback({
        ok: false,
        err: {
          message: "El nombre/sala es necesario"
        }
      });
    }
    client.join(data.sala)
    let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);
    client.broadcast.to(data.sala).emit("listaPersonas", usuarios.getPersonasSala(data.sala));
    callback(usuarios.getPersonasSala(data.sala));
  });
  client.on("crearMensaje", (data) => {
    let persona = usuarios.getPersona(client.id)
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(persona.sala).emit("crearMensaje", mensaje);
  });
  client.on('mensajePrivado', data =>{
    let persona = usuarios.getPersona(client.id)
    client.broadcast.to(data.para).emit('mensajePrivado',crearMensaje(persona.nombre, data.mensaje));
  })
  client.on("disconnect", () => {
    let personaBorrada = usuarios.borrarPersona(client.id);
    client.broadcast.to(personaBorrada.sala).emit(
      "crearMensaje",
      crearMensaje("Administrador", `${personaBorrada.nombre} abandonó el chat`)
    );
    client.broadcast.to(personaBorrada.sala).emit("listaPersonas", usuarios.getPersonasSala(personaBorrada.sala));
  });
});