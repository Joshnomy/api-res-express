const express = require('express');
const Joi = require('joi'); // IMporta Joi
const ruta = express.Router();

const usuarios = [{
        id: 1,
        nombre: 'Juan'
    },
    {
        id: 2,
        nombre: 'Ana'
    },
    {
        id: 3,
        nombre: 'Karen'
    },
    {
        id: 4,
        nombre: 'Luis'
    }
]

ruta.get('/', (req, res) => {
    res.send(usuarios);
});

/*
Como pasar parametrosdentro de las rutas
p. ej. solo quiero un usuraio especifico en vez de todos
Con los : delante del id Express
sabe que es un parametro a recibir

http://localhost:5000/api/usuarios/1990/2/sex='m'
*/
ruta.get('/:id', (req, res) => {
    //Devuelve l primer elemento del arreglo que cumpla con un predicado
    let usuario = existeUsuario(req.params.id);

    if (!usuario) {
        res.status(404).send('El usuario no se encuentra'); //Devueleve el estad HTTP
    }

    res.send(usuario);
});

/*
Tiene el msimo nombre que la peticion GET request
express hace la diferencia dependiendo del
tipo de peticion
*/
ruta.post('/', (req, res) => {
    //El objeto req tiene la propiedad body
    /*
    let body = req.body;
    console.log(body.nombre);
    res.json({
        body
    });
    */
    const { value, error } = validarUsuario(req.body.nombre);
    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: req.body.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);

    }

    //El onjeto rep tiene la propiedad body
    /*
    if (!req.body.nombre || req.body.nombre.length <= 2) { //Compruebaque existe la propiedad nombre
        res.status(400).send('Debe ingresar un nombre que tenga almenos 3 letras');
        return;
    }
    const usuario = {
        id: usuarios.length + 1,
        nombre: req.body.nombre
    };
    usuarios.push(usuario);

    res.send(usuario);
    */
});

/*
Peticion PUT
Metodo para actualizar informacion
Recibe el id del usuario ques e quiere modificar Recibe
utilizando un parametro en la ruta :id
*/
ruta.put('/:id', (req, res) => {
    //valida que el usuario se encuentre en los registros
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));

    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('El usuario no se encuentra'); //Devueleve el estad HTTP
    }
    //En el body del request debe venir la informacion para hacer la actualizacion
    //Validar que el nombre cumpla con las condiciones
    /*
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    */
    const { value, error } = validarUsuario(req.body.nombre);
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    //Atualliza el usuario
    usuario.nombre = value.nombre;
    res.send(usuario);
});

/*
Peticion DELETE
Metodo para eliminar informacion
Recibe el id del usuario ques e quiere modificar Recibe
utilizando un parametro en la ruta :id
*/
ruta.delete('/:id', (req, res) => {
    const usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(400).send('El usuario no se encuantra');
        return;
    }
    //Encontrar el indice del usuario dentro del arreglo
    //Devuelve el indice de la rimera ocurrencia del elemento
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1); //Elimina el elemento en el indice indicado
    res.send(usuario); //Responde con el usuario eliminado
});

function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return (schema.validate({ nombre: nom }));
}

module.exports = ruta; // Se exporta el objeto ruta