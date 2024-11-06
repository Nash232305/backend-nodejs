const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient(); 
// Importa el SDK de AWS y crea una instancia del cliente DocumentClient para interactuar con DynamoDB.

// Handler principal de la función Lambda.
exports.handler = async (event) => {
    // Extrae el parámetro opcional 'lastEvaluatedKey' desde los parámetros de consulta en el evento.
    const { lastEvaluatedKey } = event.queryStringParameters || {}; 
    
    // Configura los parámetros para el escaneo de la tabla DynamoDB.
    const params = {
        TableName: 'MovimientosSinpe', // Nombre de la tabla DynamoDB.
        Limit: 10, // Limita el número de elementos devueltos a 10.
        ScanIndexForward: false, // Ordena los resultados de manera descendente (los más recientes primero).
    };

    // Si se proporciona 'lastEvaluatedKey', lo añade a los parámetros del escaneo para continuar desde esa posición.
    if (lastEvaluatedKey) {
        params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastEvaluatedKey));
    }

    try {
        // Realiza la operación 'scan' en DynamoDB utilizando los parámetros configurados.
        const data = await dynamoDB.scan(params).promise();

        // Devuelve los elementos obtenidos y, si existe, la clave para paginación.
        return {
            statusCode: 200, // Respuesta HTTP exitosa.
            body: JSON.stringify({
                items: data.Items, // Lista de movimientos obtenidos de la tabla.
                lastEvaluatedKey: data.LastEvaluatedKey 
                    ? encodeURIComponent(JSON.stringify(data.LastEvaluatedKey)) 
                    : null // Codifica la clave para que sea segura para URL, o devuelve null si no hay más resultados.
            }),
        };
    } catch (error) {
        // Manejo de errores: devuelve un error HTTP 500 con el mensaje del error.
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
