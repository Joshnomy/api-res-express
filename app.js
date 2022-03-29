const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const usuarios = require('./routes/usuarios'); //Importa el archivo con las rutas para usuarios
const express = require('express'); // importa express
const logger = require('./logger');
const morgan = require('morgan');
const config = require('config');

const app = express(); //Crea una instancia de express

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
app.use("/api/usuarios", usuarios);

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

app.get('/', (req, res) => {
    res.send('Hola mundo desde express!');
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