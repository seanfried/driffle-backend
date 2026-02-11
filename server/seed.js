const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Product } = require('./models');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing database...');
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Creating users...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isEmailVerified: true
    });

    const regularUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
      isEmailVerified: true
    });

    console.log('Creating products...');
    const products = [
      {
        title: 'Cyberpunk 2077: Phantom Liberty',
        slug: 'cyberpunk-2077-phantom-liberty',
        description: 'Phantom Liberty is a new spy-thriller adventure for Cyberpunk 2077. Return as cyber-enhanced mercenary V and embark on a high-stakes mission of espionage and intrigue to save the NUS President.',
        shortDescription: 'New spy-thriller adventure for Cyberpunk 2077',
        type: 'game',
        category: 'action',
        platform: 'steam',
        genre: ['action', 'rpg'],
        publisher: 'CD PROJEKT RED',
        developer: 'CD PROJEKT RED',
        releaseDate: new Date('2023-09-26'),
        images: [
          {
            url: 'https://images.gog-statics.com/7a3439f4b2e20a375978a3d36817109749559385a216f43777555811c7501a3e_product_card_v2_mobile_slider_639.jpg',
            alt: 'Cyberpunk 2077 Cover',
            isPrimary: true
          }
        ],
        pricing: {
          basePrice: 29.99,
          salePrice: 25.49,
          discountPercentage: 15,
          plusDiscount: 10
        },
        inventory: {
          type: 'unlimited',
          sku: 'CP2077-PL-STEAM',
          quantity: 100
        },
        specifications: {
          features: ['Single-player', 'Steam Achievements'],
          languages: ['English', 'French', 'German', 'Spanish', 'Japanese']
        },
        status: 'active',
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        title: 'Elden Ring',
        slug: 'elden-ring',
        description: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
        shortDescription: 'The new fantasy action RPG from FromSoftware',
        type: 'game',
        category: 'rpg',
        platform: 'steam',
        genre: ['rpg', 'action', 'adventure'],
        publisher: 'Bandai Namco',
        developer: 'FromSoftware',
        releaseDate: new Date('2022-02-25'),
        images: [
          {
            url: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png',
            alt: 'Elden Ring Cover',
            isPrimary: true
          }
        ],
        pricing: {
          basePrice: 59.99,
          plusDiscount: 5
        },
        inventory: {
          type: 'unlimited',
          sku: 'ELDEN-RING-STEAM',
          quantity: 50
        },
        specifications: {
          features: ['Single-player', 'Multi-player', 'Co-op'],
          languages: ['English', 'French', 'German', 'Spanish', 'Italian']
        },
        status: 'active',
        isFeatured: true,
        createdBy: adminUser._id
      },
      {
        title: 'PlayStation Store Gift Card 50€',
        slug: 'psn-card-50',
        description: 'Top up your PlayStation®Network wallet with this 50 EUR Gift Card. Buy games, add-ons, movies and more from PlayStation®Store.',
        shortDescription: '50 EUR Wallet Top Up for PlayStation Network',
        type: 'gift-card',
        category: 'gift-card',
        platform: 'playstation',
        genre: [],
        publisher: 'Sony Interactive Entertainment',
        images: [
          {
            url: 'https://gmedia.playstation.com/is/image/SIEPDC/playstation-store-gift-card-50-us-15jun22?$1600px$',
            alt: 'PSN 50 EUR Card',
            isPrimary: true
          }
        ],
        pricing: {
          basePrice: 50.00,
          salePrice: 48.99,
          discountPercentage: 2
        },
        inventory: {
          type: 'limited',
          sku: 'PSN-50-EU',
          quantity: 20
        },
        status: 'active',
        createdBy: adminUser._id
      },
      {
        title: 'Xbox Game Pass Ultimate - 3 Months',
        slug: 'xbox-game-pass-ultimate-3m',
        description: 'Get unlimited access to over 100 high-quality games on console and PC. Includes Xbox Live Gold and EA Play.',
        shortDescription: '3 Months Subscription to Xbox Game Pass Ultimate',
        type: 'subscription',
        category: 'action',
        platform: 'xbox',
        genre: [],
        publisher: 'Microsoft',
        images: [
          {
            url: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4FkI2?ver=1510',
            alt: 'Xbox Game Pass Ultimate',
            isPrimary: true
          }
        ],
        pricing: {
          basePrice: 38.99,
          salePrice: 29.99,
          discountPercentage: 23,
          plusDiscount: 5
        },
        inventory: {
          type: 'unlimited',
          sku: 'XBOX-GPU-3M',
          quantity: 100
        },
        status: 'active',
        isOnSale: true,
        createdBy: adminUser._id
      },
      {
        title: 'Minecraft: Java & Bedrock Edition',
        slug: 'minecraft-java-bedrock',
        description: 'Create, explore, survive and repeat. Minecraft: Java & Bedrock Edition for PC brings the two versions of the game together in one purchase.',
        shortDescription: 'The best-selling game of all time',
        type: 'game',
        category: 'adventure',
        platform: 'xbox', // PC version often sold via Xbox/Microsoft store backend
        genre: ['adventure', 'simulation', 'indie'],
        publisher: 'Mojang Studios',
        developer: 'Mojang Studios',
        releaseDate: new Date('2011-11-18'),
        images: [
          {
            url: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2217/LsaUVbVIZ2Tp088b776p178x.png',
            alt: 'Minecraft Cover',
            isPrimary: true
          }
        ],
        pricing: {
          basePrice: 29.99,
          plusDiscount: 10
        },
        inventory: {
          type: 'unlimited',
          sku: 'MINECRAFT-PC',
          quantity: 1000
        },
        specifications: {
          features: ['Cross-platform play', 'Multiplayer'],
          languages: ['English', 'French', 'German', 'Spanish', 'Italian', 'Russian']
        },
        status: 'active',
        createdBy: adminUser._id
      }
    ];

    await Product.insertMany(products);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();