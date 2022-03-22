const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const express = require('express'); // importa express
const logger = require('./logger');
const morgan = require('morgan');
const config = require('config');

const app = express(); //Crea una instancia de express
const Joi = require('joi');

/*
Middleware
El middleware es un bloque de codigo que se ejecuta
entre las peticiones del usuario (cliente) y el
request que llega al servidos. Es un enlace entre la peticion
del usuario y el servidor, antes de que este pueda dar una respuesta

Las funciones de middleware son funciones que tienen acceso
al objetp de epeticion (request, req), al objeto de respuesta (response, res)
y a la siguiente funcion de middleware es el ciclo de peticiones/respuestas
de la aplicacion. La siguiente funcion de middleware se denota
normalmente con una variable denominada next.

Las funciones de middlewware puede realizar las siguientes tareas:
    - Ejecuta cualquier codigo
    - Realiza cambios en la peticion y los objetos de respuesta
    - Finalizar el ciclo de peticion/respuesta
    - Invoca la siguiente funcion de middleware en la pila

Express en un framework de direccionamieto y de uso de middleware
que permite que la aplicacion tenga funcionalidad minima propia

Ya usamos algunos middleware como express.json()
transforma el body del req a formato JSON

          -----------------------
request -|-> json() --> route() -|-> response
          -----------------------

route() --> Funciones GET, POST, PUT, DELETE

JSON hace un parsing de la entrada a formato JSON
de tal forma que lo recibamos en el req de una 
peticio este en formato JSON
*/
app.use(express.json()); // se le dice a express que use este middleware
app.use(express.urlencoded({ extended: true }));
//public es el nombre de la carpeta que tendra los recursos estaticos
app.use(express.static('public'));

console.log(`Aplicacion: ${config.get('nombre')}`);
console.log(`DB server: ${config.get('configDB.host')}`);

// Uso de middleware de terceros - morgan
if (app.get('env') == 'development') {
    app.use(morgan('tiny'));
    inicioDebug('Morgan esta habilitado...');
}

//Operaciones con la base de datos
dbDebug('Conectando a la base de datos...');

/*
app.use(logger); //logger hace referencia a la funcion log (export)

app.use(function(req, res, next) {
    console.log('Autentificando...');
    next();
});
*/

/*
Query string
url/?val1=valor1&var2=valor2&var3=valor3...

Hay cuatro tipo de peticiones
asociadas con las operaciones CRED de una base de datos

app.get(); //consulta de datos
app.post();  //Envia datos al servidor (insertar datos)
app.put(); // Actualiza datos
app.delete(); //Elimina datos
*/

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


app.get('/', (req, res) => {
    res.send('Hola mundo desde express!');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

/*
Como pasar parametrosdentro de las rutas
p. ej. solo quiero un usuraio especifico en vez de todos
Con los : delante del id Express
sabe que es un parametro a recibir

http://localhost:5000/api/usuarios/1990/2/sex='m'
*/
app.get('/api/usuarios/:id', (req, res) => {
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
app.post('/api/usuarios', (req, res) => {
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
app.put('/api/usuarios/:id', (req, res) => {
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
app.delete('/api/usuarios/:id', (req, res) => {
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

/*
Usando el modulo process, se lee una variable
de entorno.
Si la variablle no existe, va a tomar un valor
por dafault (3000)
*/
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`);
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