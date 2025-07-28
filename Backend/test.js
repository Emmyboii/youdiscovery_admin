// test.js
import mongodb from 'mongodb';
const { MongoClient } = mongodb;

const CLIENT_MONGO_URI =
    'mongodb+srv://readonly_client:readonly_client123@cluster0.reotwsp.mongodb.net/youdiscovery?retryWrites=true&w=majority&appName=Cluster0';

async function debugConnection() {
    console.log('🔍 Debug Connection Test');
    console.log(
        'Connection string (masked):',
        CLIENT_MONGO_URI.replace(/:[^:@]+@/, ':*@')
    );

    const client = new MongoClient(CLIENT_MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
    });

    try {
        console.log('\n🔌 Attempting connection...');
        await client.connect();
        console.log('✅ Connection successful!');

        const db = client.db('youdiscovery');
        console.log('📊 Connected to database: youdiscovery');

        const collections = await db.listCollections().toArray();
        console.log(
            `Available collections: ${collections.map((c) => c.name).join(', ')}`
        );

        if (collections.some((c) => c.name === 'users')) {
            console.log('\n👥 Testing users collection...');
            const userCount = await db.collection('users').countDocuments();
            console.log(`Total users in collection: ${userCount}`);

            if (userCount > 0) {
                const sampleUser = await db.collection('users').findOne(
                    {},
                    {
                        projection: { firstName: 1, email: 1, role: 1, _id: 1 },
                    }
                );
                console.log('👤 Sample user:', sampleUser);
            }
        } else {
            console.log('❌ Users collection not found!');
        }
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        if (error.code === 8000) {
            console.log('\n🔧 Troubleshooting tips:');
            console.log('1. Check if username/password are correct');
            console.log('2. Verify the user exists in Database Access');
            console.log("3. Ensure the user has 'read' role on 'youdiscovery' database");
            console.log('4. Check Network Access (IP whitelist)');
        }
    } finally {
        await client.close();
    }
}

debugConnection();
