import { MongoClient } from 'mongodb';


const CLIENT_MONGO_URI =
    'mongodb+srv://readonly_client:readonly_client123@cluster0.reotwsp.mongodb.net/youdiscovery?retryWrites=true&w=majority&appName=Cluster0';

async function debugConnection() {
    console.log('🔍 Debug Connection Test');
    console.log(
        'Connection string (masked):',
        CLIENT_MONGO_URI.replace(/:[^:@]@/, ':*@')
    );

    const client = new MongoClient(CLIENT_MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    try {
        console.log('\n🔌 Attempting connection...');
        await client.connect();
        console.log('✅ Connection successful!');

        // Test database access
        const db = client.db('youdiscovery');
        console.log('📊 Connected to database: youdiscovery');

        // List collections to verify access
        const collections = await db.listCollections().toArray();
        console.log(
            `Available collections: ${collections.map((c) => c.name).join(', ')}`
        );

        // Test users collection specifically
        if (collections.some((c) => c.name === 'categories')) {
            console.log('\n👥 Testing categories collection...');
            const userCount = await db.collection('categories').countDocuments();
            console.log(`Total categories in collection: ${userCount}`);

            // if (userCount > 0) {
            //     const sampleUser = await db.collection('blogs').findOne(
            //         {},
            //         {
            //             projection: { firstName: 1, email: 1, role: 1, _id: 1 },
            //         }
            //     );
            //     console.log('👤 Sample user:', sampleUser);
            // }
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
            console.log(
                "3. Ensure the user has 'read' role on 'youdiscovery' database"
            );
            console.log('4. Check Network Access (IP whitelist)');
        }
    } finally {
        await client.close();
    }
}

debugConnection();