const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
// Importa el SDK de AWS y crea una instancia del cliente DocumentClient para interactuar con DynamoDB.

// Handler principal de la función Lambda.
exports.handler = async (event) => {
    // Obtiene los parámetros `id` y `fecha` desde la ruta de la solicitud (event.pathParameters).
    const { id, fecha } = event.pathParameters;

    // Configura los parámetros para la consulta de DynamoDB.
    const params = {
        TableName: 'MovimientosSinpe', // Nombre de la tabla DynamoDB donde se encuentran los movimientos.
        KeyConditionExpression: 'id = :id and fecha = :fecha', 
        // Define la condición de consulta basada en la clave primaria compuesta.
        ExpressionAttributeValues: {
            ':id': id, // Valor para el identificador único del movimiento.
            ':fecha': fecha // Valor para la fecha específica del movimiento.
        }
    };

    try {
        // Realiza la consulta a DynamoDB utilizando los parámetros configurados.
        const data = await dynamoDB.query(params).promise();

        // Verifica si no se encontró ningún movimiento que coincida con los parámetros.
        if (data.Items.length === 0) {
            return {
                statusCode: 404, // Devuelve un código HTTP 404 si no se encuentra el movimiento.
                body: JSON.stringify({ error: "Movimiento no encontrado" }) // Mensaje indicando que no hay coincidencias.
            };
        }

        // Devuelve el primer (y único) elemento encontrado en la consulta como respuesta.
        return {
            statusCode: 200, // Respuesta HTTP exitosa.
            body: JSON.stringify(data.Items[0]) // Incluye los detalles del movimiento en el cuerpo de la respuesta.
        };
    } catch (error) {
        // Manejo de errores: devuelve un error HTTP 500 con detalles del problema.
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }) // Devuelve el mensaje de error para facilitar el diagnóstico.
        };
    }
};
