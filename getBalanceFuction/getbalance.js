const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient(); 
// Importa el SDK de AWS y crea una instancia del cliente DocumentClient para interactuar con DynamoDB.

// Handler principal de la función Lambda.
exports.handler = async (event) => {
    // Configura los parámetros para obtener el balance del usuario.
    const params = {
        TableName: 'UsuariosBalance', // Nombre de la tabla DynamoDB que almacena los balances de los usuarios.
        Key: {
            userId: "default_user"  // Especifica la clave primaria (userId) para obtener el balance del usuario.
            // Aquí se usa un valor predeterminado ("default_user"), pero esto podría ajustarse según las necesidades.
        }
    };

    try {
        // Realiza una operación `get` en DynamoDB para obtener el balance del usuario.
        const data = await dynamoDB.get(params).promise();

        // Devuelve una respuesta exitosa con el balance del usuario si se encuentra.
        return {
            statusCode: 200, // Respuesta HTTP exitosa.
            body: JSON.stringify({ balance: data.Item.balance }), // Incluye el balance en el cuerpo de la respuesta.
        };
    } catch (error) {
        // Manejo de errores: devuelve un error HTTP 500 con el mensaje de error.
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }), // Devuelve detalles del error para facilitar el debug.
        };
    }
};
