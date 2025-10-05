import {
  PrismaClient,
  StatutCourse,
  StatutIncident,
  StatutMaintenance,
  TypeDocument,
  TypeIncident,
  CategoryVehicule,
  FuelType,
  GearType,
  TypeVehicule,
  StatutVehicule,
  StatutChauffeur,
  StatutActivite,
  StatutClient,
  StatutTransport,
  TypeNotification,
  TypeExpediteur,
  StatutLocation,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Début du seeding complet...");

  // ========== NETTOYAGE DES DONNÉES EXISTANTES ==========
  console.log("🧹 Nettoyage des données existantes...");

  await prisma.adminMessage.deleteMany();
  await prisma.favoriteDestination.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transport.deleteMany();
  await prisma.locationVehicule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.document.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.credit.deleteMany();
  await prisma.chauffeur.deleteMany();
  await prisma.client.deleteMany();
  await prisma.vehicule.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Nettoyage terminé");

  // ========== UTILISATEURS ADMIN ==========
  console.log("👥 Création des utilisateurs admin...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@madamove.com",
      password: adminPassword,
      nom: "Admin",
      prenom: "Super",
      role: "ADMIN",
    },
  });

  const managerPassword = await bcrypt.hash("manager123", 10);
  const manager = await prisma.user.create({
    data: {
      email: "manager@madamove.com",
      password: managerPassword,
      nom: "Manager",
      prenom: "Team",
      role: "GESTIONNAIRE",
    },
  });

  const supportPassword = await bcrypt.hash("support123", 10);
  const support = await prisma.user.create({
    data: {
      email: "support@madamove.com",
      password: supportPassword,
      nom: "Support",
      prenom: "Tech",
      role: "SUPPORT",
    },
  });

  console.log("✅ Utilisateurs admin créés:", {
    admin: admin.id,
    manager: manager.id,
    support: support.id,
  });
  // ========== VÉHICULES ==========
  console.log("🚗 Création des véhicules...");

  const vehicules = await Promise.all([
    // Véhicules BASIC
    prisma.vehicule.create({
      data: {
        marque: "Renault",
        modele: "Clio",
        immatriculation: "AB-123-CD",
        type: TypeVehicule.BERLINE,
        categorie: CategoryVehicule.BASIC,
        statut: StatutVehicule.DISPONIBLE,
        tarifHoraire: 25.0,
        tarifJournalier: 180.0,
        maxPower: 90,
        fuelConsumption: 6.5,
        maxSpeed: 180,
        acceleration: 11.2,
        capacity: 5,
        color: "Blanc",
        fuelType: FuelType.ESSENCE,
        gearType: GearType.MANUEL,
        dateAcquisition: new Date("2023-01-15"),
        kilometrage: 15000,
        photos: ["clio1.jpg", "clio2.jpg"],
        dateControleTechnique: new Date("2024-01-15"),
      },
    }),

    prisma.vehicule.create({
      data: {
        marque: "Peugeot",
        modele: "208",
        immatriculation: "EF-456-GH",
        type: TypeVehicule.BERLINE,
        categorie: CategoryVehicule.BASIC,
        statut: StatutVehicule.DISPONIBLE,
        tarifHoraire: 28.0,
        tarifJournalier: 200.0,
        maxPower: 100,
        fuelConsumption: 5.8,
        maxSpeed: 190,
        acceleration: 10.8,
        capacity: 5,
        color: "Gris",
        fuelType: FuelType.ESSENCE,
        gearType: GearType.AUTOMATIQUE,
        dateAcquisition: new Date("2023-02-20"),
        kilometrage: 8000,
        photos: ["208_1.jpg"],
        dateControleTechnique: new Date("2024-02-20"),
      },
    }),

    // Véhicules CONFORT
    prisma.vehicule.create({
      data: {
        marque: "Peugeot",
        modele: "3008",
        immatriculation: "IJ-789-KL",
        type: TypeVehicule.SUV,
        categorie: CategoryVehicule.CONFORT,
        statut: StatutVehicule.DISPONIBLE,
        tarifHoraire: 35.0,
        tarifJournalier: 250.0,
        maxPower: 130,
        fuelConsumption: 7.2,
        maxSpeed: 200,
        acceleration: 9.5,
        capacity: 5,
        color: "Noir",
        fuelType: FuelType.DIESEL,
        gearType: GearType.AUTOMATIQUE,
        dateAcquisition: new Date("2023-03-10"),
        kilometrage: 22000,
        photos: ["3008_1.jpg", "3008_2.jpg"],
        dateControleTechnique: new Date("2024-03-10"),
      },
    }),

    prisma.vehicule.create({
      data: {
        marque: "Volkswagen",
        modele: "Tiguan",
        immatriculation: "MN-012-OP",
        type: TypeVehicule.SUV,
        categorie: CategoryVehicule.CONFORT,
        statut: StatutVehicule.DISPONIBLE,
        tarifHoraire: 38.0,
        tarifJournalier: 280.0,
        maxPower: 150,
        fuelConsumption: 7.8,
        maxSpeed: 210,
        acceleration: 8.9,
        capacity: 5,
        color: "Bleu",
        fuelType: FuelType.DIESEL,
        gearType: GearType.AUTOMATIQUE,
        dateAcquisition: new Date("2023-04-05"),
        kilometrage: 5000,
        photos: ["tiguan1.jpg"],
        dateControleTechnique: new Date("2024-04-05"),
      },
    }),

    // Véhicules FAMILIALE
    prisma.vehicule.create({
      data: {
        marque: "Citroën",
        modele: "Jumpy",
        immatriculation: "QR-345-ST",
        type: TypeVehicule.VAN,
        categorie: CategoryVehicule.FAMILIALE,
        statut: StatutVehicule.DISPONIBLE,
        tarifHoraire: 45.0,
        tarifJournalier: 320.0,
        maxPower: 120,
        fuelConsumption: 8.5,
        maxSpeed: 180,
        acceleration: 12.5,
        capacity: 8,
        color: "Blanc",
        fuelType: FuelType.DIESEL,
        gearType: GearType.MANUEL,
        dateAcquisition: new Date("2023-05-12"),
        kilometrage: 3000,
        photos: ["jumpy1.jpg", "jumpy2.jpg"],
        dateControleTechnique: new Date("2024-05-12"),
      },
    }),

    // Véhicules VIP
    prisma.vehicule.create({
      data: {
        marque: "Mercedes",
        modele: "Classe E",
        immatriculation: "UV-678-WX",
        type: TypeVehicule.BERLINE,
        categorie: CategoryVehicule.VIP,
        statut: StatutVehicule.DISPONIBLE,
        tarifHoraire: 80.0,
        tarifJournalier: 600.0,
        maxPower: 220,
        fuelConsumption: 9.2,
        maxSpeed: 250,
        acceleration: 6.8,
        capacity: 5,
        color: "Noir métallisé",
        fuelType: FuelType.DIESEL,
        gearType: GearType.AUTOMATIQUE,
        dateAcquisition: new Date("2023-06-15"),
        kilometrage: 12000,
        photos: ["mercedes1.jpg", "mercedes2.jpg", "mercedes3.jpg"],
        dateControleTechnique: new Date("2024-06-15"),
      },
    }),

    prisma.vehicule.create({
      data: {
        marque: "Tesla",
        modele: "Model S",
        immatriculation: "YZ-901-AB",
        type: TypeVehicule.BERLINE,
        categorie: CategoryVehicule.VIP,
        statut: StatutVehicule.DISPONIBLE,
        tarifHoraire: 90.0,
        tarifJournalier: 700.0,
        maxPower: 400,
        fuelConsumption: 0, // Électrique
        maxSpeed: 250,
        acceleration: 3.2,
        capacity: 5,
        color: "Rouge",
        fuelType: FuelType.ELECTRIQUE,
        gearType: GearType.AUTOMATIQUE,
        dateAcquisition: new Date("2023-07-20"),
        kilometrage: 8000,
        photos: ["tesla1.jpg", "tesla2.jpg"],
        dateControleTechnique: new Date("2024-07-20"),
      },
    }),

    // Véhicules BUS
    prisma.vehicule.create({
      data: {
        marque: "Mercedes",
        modele: "Sprinter",
        immatriculation: "CD-234-EF",
        type: TypeVehicule.BUS,
        categorie: CategoryVehicule.BUS,
        statut: StatutVehicule.DISPONIBLE,
        tarifHoraire: 60.0,
        tarifJournalier: 450.0,
        maxPower: 163,
        fuelConsumption: 10.5,
        maxSpeed: 160,
        acceleration: 15.2,
        capacity: 15,
        color: "Blanc",
        fuelType: FuelType.DIESEL,
        gearType: GearType.MANUEL,
        dateAcquisition: new Date("2023-08-10"),
        kilometrage: 25000,
        photos: ["sprinter1.jpg"],
        dateControleTechnique: new Date("2024-08-10"),
      },
    }),

    // Véhicule en maintenance
    prisma.vehicule.create({
      data: {
        marque: "Renault",
        modele: "Master",
        immatriculation: "GH-567-IJ",
        type: TypeVehicule.VAN,
        categorie: CategoryVehicule.FAMILIALE,
        statut: StatutVehicule.EN_MAINTENANCE,
        tarifHoraire: 50.0,
        tarifJournalier: 380.0,
        maxPower: 135,
        fuelConsumption: 9.8,
        maxSpeed: 170,
        acceleration: 13.8,
        capacity: 9,
        color: "Gris",
        fuelType: FuelType.DIESEL,
        gearType: GearType.MANUEL,
        dateAcquisition: new Date("2023-09-05"),
        kilometrage: 35000,
        photos: ["master1.jpg"],
        dateControleTechnique: new Date("2024-09-05"),
      },
    }),

    // Véhicule assigné
    prisma.vehicule.create({
      data: {
        marque: "BMW",
        modele: "X5",
        immatriculation: "KL-890-MN",
        type: TypeVehicule.SUV,
        categorie: CategoryVehicule.VIP,
        statut: StatutVehicule.ASSIGNE,
        tarifHoraire: 85.0,
        tarifJournalier: 650.0,
        maxPower: 265,
        fuelConsumption: 11.2,
        maxSpeed: 240,
        acceleration: 6.5,
        capacity: 7,
        color: "Noir",
        fuelType: FuelType.ESSENCE,
        gearType: GearType.AUTOMATIQUE,
        dateAcquisition: new Date("2023-10-12"),
        kilometrage: 18000,
        photos: ["bmw1.jpg", "bmw2.jpg"],
        dateControleTechnique: new Date("2024-10-12"),
      },
    }),
  ]);

  console.log("✅ Véhicules créés:", vehicules.length);
  // ========== CHAUFFEURS ==========
  console.log("👨‍💼 Création des chauffeurs...");

  const chauffeurPassword = await bcrypt.hash("chauffeur123", 10);

  const chauffeurs = await Promise.all([
    prisma.chauffeur.create({
      data: {
        nom: "Dupont",
        prenom: "Jean",
        email: "jean.dupont@madamove.com",
        password: chauffeurPassword,
        telephone: "+33123456789",
        statut: StatutChauffeur.SALARIE,
        evaluation: 4.8,
        statutActivite: StatutActivite.ACTIF,
        nbCourses: 150,
        vehiculeId: vehicules[0].id, // Renault Clio
        phoneVerified: true,
        photoUrl: "jean_dupont.jpg",
      },
    }),

    prisma.chauffeur.create({
      data: {
        nom: "Martin",
        prenom: "Sophie",
        email: "sophie.martin@madamove.com",
        password: chauffeurPassword,
        telephone: "+33987654321",
        statut: StatutChauffeur.INDEPENDANT,
        evaluation: 4.5,
        statutActivite: StatutActivite.ACTIF,
        nbCourses: 80,
        vehiculeId: vehicules[1].id, // Peugeot 208
        phoneVerified: true,
        photoUrl: "sophie_martin.jpg",
      },
    }),

    prisma.chauffeur.create({
      data: {
        nom: "Dubois",
        prenom: "Pierre",
        email: "pierre.dubois@madamove.com",
        password: chauffeurPassword,
        telephone: "+33654321987",
        statut: StatutChauffeur.SALARIE,
        evaluation: 4.2,
        statutActivite: StatutActivite.ACTIF,
        nbCourses: 120,
        vehiculeId: vehicules[2].id, // Peugeot 3008
        phoneVerified: true,
        photoUrl: "pierre_dubois.jpg",
      },
    }),

    prisma.chauffeur.create({
      data: {
        nom: "Leroy",
        prenom: "Marie",
        email: "marie.leroy@madamove.com",
        password: chauffeurPassword,
        telephone: "+33712345678",
        statut: StatutChauffeur.SALARIE,
        evaluation: 4.9,
        statutActivite: StatutActivite.ACTIF,
        nbCourses: 200,
        vehiculeId: vehicules[5].id, // Mercedes Classe E
        phoneVerified: true,
        photoUrl: "marie_leroy.jpg",
      },
    }),

    prisma.chauffeur.create({
      data: {
        nom: "Bernard",
        prenom: "Thomas",
        email: "thomas.bernard@madamove.com",
        password: chauffeurPassword,
        telephone: "+33698765432",
        statut: StatutChauffeur.INDEPENDANT,
        evaluation: 4.6,
        statutActivite: StatutActivite.ACTIF,
        nbCourses: 110,
        vehiculeId: vehicules[6].id, // Tesla Model S
        phoneVerified: true,
        photoUrl: "thomas_bernard.jpg",
      },
    }),

    prisma.chauffeur.create({
      data: {
        nom: "Garcia",
        prenom: "Carlos",
        email: "carlos.garcia@madamove.com",
        password: chauffeurPassword,
        telephone: "+33611223344",
        statut: StatutChauffeur.SALARIE,
        evaluation: 4.4,
        statutActivite: StatutActivite.ACTIF,
        nbCourses: 95,
        vehiculeId: vehicules[7].id, // Mercedes Sprinter
        phoneVerified: true,
        photoUrl: "carlos_garcia.jpg",
      },
    }),

    prisma.chauffeur.create({
      data: {
        nom: "Petit",
        prenom: "Nicolas",
        email: "nicolas.petit@madamove.com",
        password: chauffeurPassword,
        telephone: "+33655443322",
        statut: StatutChauffeur.INDEPENDANT,
        evaluation: 4.7,
        statutActivite: StatutActivite.INACTIF,
        nbCourses: 75,
        vehiculeId: vehicules[9].id, // BMW X5
        phoneVerified: true,
        photoUrl: "nicolas_petit.jpg",
      },
    }),

    // Chauffeur sans véhicule assigné
    prisma.chauffeur.create({
      data: {
        nom: "Rousseau",
        prenom: "Amélie",
        email: "amelie.rousseau@madamove.com",
        password: chauffeurPassword,
        telephone: "+33644556677",
        statut: StatutChauffeur.SALARIE,
        evaluation: 4.1,
        statutActivite: StatutActivite.ACTIF,
        nbCourses: 45,
        phoneVerified: false,
        photoUrl: "amelie_rousseau.jpg",
      },
    }),

    // Chauffeur suspendu
    prisma.chauffeur.create({
      data: {
        nom: "Morel",
        prenom: "Julien",
        email: "julien.morel@madamove.com",
        password: chauffeurPassword,
        telephone: "+33633445566",
        statut: StatutChauffeur.INDEPENDANT,
        evaluation: 3.8,
        statutActivite: StatutActivite.SUSPENDU,
        nbCourses: 30,
        phoneVerified: true,
        photoUrl: "julien_morel.jpg",
      },
    }),

    // Nouveau chauffeur
    prisma.chauffeur.create({
      data: {
        nom: "Lefebvre",
        prenom: "Sandrine",
        email: "sandrine.lefebvre@madamove.com",
        password: chauffeurPassword,
        telephone: "+33622334455",
        statut: StatutChauffeur.SALARIE,
        evaluation: 0,
        statutActivite: StatutActivite.ACTIF,
        nbCourses: 0,
        phoneVerified: false,
      },
    }),
  ]);

  console.log("✅ Chauffeurs créés:", chauffeurs.length);

  // ========== CRÉDITS POUR CHAUFFEURS INDÉPENDANTS ==========
  console.log("💰 Création des crédits...");

  const credits = await Promise.all(
    chauffeurs
      .filter((c) => c.statut === StatutChauffeur.INDEPENDANT)
      .map((chauffeur) =>
        prisma.credit.create({
          data: {
            chauffeurId: chauffeur.id,
            solde: Math.floor(Math.random() * 500) + 100, // Entre 100 et 600€
          },
        })
      )
  );

  console.log("✅ Crédits créés:", credits.length);
  // ========== CLIENTS ==========
  console.log("👥 Création des clients...");

  const clientPassword = await bcrypt.hash("client123", 10);

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        nom: "Doe",
        prenom: "John",
        email: "john.doe@gmail.com",
        password: clientPassword,
        telephone: "+33123456789",
        adresse: "123 Rue de la Paix",
        ville: "Paris",
        statut: StatutClient.ACTIF,
        nbCourses: 25,
        verified: true,
        phoneVerified: true,
        stripeCustomerId: "cus_test_john_doe",
        profileUrl: "john_doe.jpg",
      },
    }),

    prisma.client.create({
      data: {
        nom: "Smith",
        prenom: "Jane",
        email: "jane.smith@gmail.com",
        password: clientPassword,
        telephone: "+33987654321",
        adresse: "456 Avenue des Champs",
        ville: "Lyon",
        statut: StatutClient.ACTIF,
        nbCourses: 15,
        verified: true,
        phoneVerified: true,
        stripeCustomerId: "cus_test_jane_smith",
        profileUrl: "jane_smith.jpg",
      },
    }),

    prisma.client.create({
      data: {
        nom: "Johnson",
        prenom: "Robert",
        email: "robert.johnson@outlook.com",
        password: clientPassword,
        telephone: "+33678901234",
        adresse: "789 Boulevard Saint-Michel",
        ville: "Marseille",
        statut: StatutClient.ACTIF,
        nbCourses: 30,
        verified: true,
        phoneVerified: true,
        stripeCustomerId: "cus_test_robert_johnson",
        profileUrl: "robert_johnson.jpg",
      },
    }),

    prisma.client.create({
      data: {
        nom: "Brown",
        prenom: "Emma",
        email: "emma.brown@yahoo.com",
        password: clientPassword,
        telephone: "+33712345678",
        adresse: "321 Rue Victor Hugo",
        ville: "Paris",
        statut: StatutClient.ACTIF,
        nbCourses: 40,
        verified: true,
        phoneVerified: true,
        stripeCustomerId: "cus_test_emma_brown",
        profileUrl: "emma_brown.jpg",
      },
    }),

    prisma.client.create({
      data: {
        nom: "Davis",
        prenom: "Michael",
        email: "michael.davis@hotmail.com",
        password: clientPassword,
        telephone: "+33698765432",
        adresse: "654 Place de la République",
        ville: "Bordeaux",
        statut: StatutClient.ACTIF,
        nbCourses: 5,
        verified: true,
        phoneVerified: false,
        stripeCustomerId: "cus_test_michael_davis",
      },
    }),

    prisma.client.create({
      data: {
        nom: "Wilson",
        prenom: "Sarah",
        email: "sarah.wilson@gmail.com",
        password: clientPassword,
        telephone: "+33655443322",
        adresse: "987 Cours Mirabeau",
        ville: "Aix-en-Provence",
        statut: StatutClient.ACTIF,
        nbCourses: 18,
        verified: true,
        phoneVerified: true,
        stripeCustomerId: "cus_test_sarah_wilson",
        profileUrl: "sarah_wilson.jpg",
      },
    }),

    prisma.client.create({
      data: {
        nom: "Taylor",
        prenom: "David",
        email: "david.taylor@gmail.com",
        password: clientPassword,
        telephone: "+33644556677",
        adresse: "147 Rue Nationale",
        ville: "Toulouse",
        statut: StatutClient.ACTIF,
        nbCourses: 12,
        verified: false,
        phoneVerified: false,
        validationCode: "123456",
      },
    }),

    prisma.client.create({
      data: {
        nom: "Anderson",
        prenom: "Lisa",
        email: "lisa.anderson@yahoo.fr",
        password: clientPassword,
        telephone: "+33633445566",
        adresse: "258 Avenue de la Liberté",
        ville: "Nice",
        statut: StatutClient.ACTIF,
        nbCourses: 22,
        verified: true,
        phoneVerified: true,
        stripeCustomerId: "cus_test_lisa_anderson",
        profileUrl: "lisa_anderson.jpg",
      },
    }),

    // Client inactif
    prisma.client.create({
      data: {
        nom: "Garcia",
        prenom: "Pedro",
        email: "pedro.garcia@gmail.com",
        password: clientPassword,
        telephone: "+33622334455",
        adresse: "369 Place Bellecour",
        ville: "Lyon",
        statut: StatutClient.INACTIF,
        nbCourses: 3,
        verified: true,
        phoneVerified: true,
      },
    }),

    // Client banni
    prisma.client.create({
      data: {
        nom: "Martinez",
        prenom: "Ana",
        email: "ana.martinez@hotmail.fr",
        password: clientPassword,
        telephone: "+33611223344",
        adresse: "741 Rue de Rivoli",
        ville: "Paris",
        statut: StatutClient.BANNI,
        nbCourses: 1,
        verified: true,
        phoneVerified: true,
      },
    }),

    // Nouveau client
    prisma.client.create({
      data: {
        nom: "Lee",
        prenom: "Kevin",
        email: "kevin.lee@gmail.com",
        password: clientPassword,
        telephone: "+33600112233",
        adresse: "852 Boulevard Gambetta",
        ville: "Nantes",
        statut: StatutClient.ACTIF,
        nbCourses: 0,
        verified: false,
        phoneVerified: false,
        validationCode: "789012",
      },
    }),

    // Client VIP
    prisma.client.create({
      data: {
        nom: "Moreau",
        prenom: "Catherine",
        email: "catherine.moreau@entreprise.fr",
        password: clientPassword,
        telephone: "+33655667788",
        adresse: "963 Avenue Foch",
        ville: "Paris",
        statut: StatutClient.ACTIF,
        nbCourses: 85,
        verified: true,
        phoneVerified: true,
        stripeCustomerId: "cus_test_catherine_moreau",
        profileUrl: "catherine_moreau.jpg",
      },
    }),
  ]);

  console.log("✅ Clients créés:", clients.length);
  // ========== DESTINATIONS FAVORITES ==========
  console.log("📍 Création des destinations favorites...");

  const favoriteDestinations = await Promise.all([
    // Pour John Doe
    prisma.favoriteDestination.create({
      data: {
        title: "Domicile",
        address: "123 Rue de la Paix, 75001 Paris",
        description: "Mon domicile",
        latitude: 48.8606111,
        longitude: 2.3376,
        clientId: clients[0].id,
      },
    }),
    prisma.favoriteDestination.create({
      data: {
        title: "Bureau",
        address: "La Défense, 92400 Courbevoie",
        description: "Mon lieu de travail",
        latitude: 48.8917,
        longitude: 2.2389,
        clientId: clients[0].id,
      },
    }),
    prisma.favoriteDestination.create({
      data: {
        title: "Aéroport CDG",
        address: "Aéroport Charles de Gaulle, 95700 Roissy-en-France",
        description: "Aéroport pour voyages d'affaires",
        latitude: 49.0097,
        longitude: 2.5479,
        clientId: clients[0].id,
      },
    }),

    // Pour Jane Smith
    prisma.favoriteDestination.create({
      data: {
        title: "Gare Part-Dieu",
        address: "Gare de Lyon Part-Dieu, 69003 Lyon",
        description: "Gare principale de Lyon",
        latitude: 45.7603,
        longitude: 4.8596,
        clientId: clients[1].id,
      },
    }),
    prisma.favoriteDestination.create({
      data: {
        title: "Centre Commercial",
        address: "Centre Commercial Part-Dieu, 69003 Lyon",
        description: "Shopping",
        latitude: 45.7614,
        longitude: 4.8559,
        clientId: clients[1].id,
      },
    }),

    // Pour Robert Johnson
    prisma.favoriteDestination.create({
      data: {
        title: "Vieux-Port",
        address: "Vieux-Port de Marseille, 13001 Marseille",
        description: "Port historique",
        latitude: 43.2951,
        longitude: 5.378,
        clientId: clients[2].id,
      },
    }),
    prisma.favoriteDestination.create({
      data: {
        title: "Aéroport Marseille",
        address: "Aéroport Marseille Provence, 13727 Marignane",
        description: "Aéroport de Marseille",
        latitude: 43.4372,
        longitude: 5.214,
        clientId: clients[2].id,
      },
    }),

    // Pour Emma Brown
    prisma.favoriteDestination.create({
      data: {
        title: "Tour Eiffel",
        address: "Champ de Mars, 75007 Paris",
        description: "Monument emblématique",
        latitude: 48.8584,
        longitude: 2.2945,
        clientId: clients[3].id,
      },
    }),
    prisma.favoriteDestination.create({
      data: {
        title: "Gare du Nord",
        address: "Gare du Nord, 75010 Paris",
        description: "Gare principale",
        latitude: 48.8809,
        longitude: 2.3553,
        clientId: clients[3].id,
      },
    }),

    // Pour Catherine Moreau (cliente VIP)
    prisma.favoriteDestination.create({
      data: {
        title: "Siège Social",
        address: "Avenue Foch, 75016 Paris",
        description: "Siège de l'entreprise",
        latitude: 48.8738,
        longitude: 2.2874,
        clientId: clients[11].id,
      },
    }),
    prisma.favoriteDestination.create({
      data: {
        title: "Aéroport Orly",
        address: "Aéroport d'Orly, 94390 Orly",
        description: "Déplacements professionnels",
        latitude: 48.7233,
        longitude: 2.3792,
        clientId: clients[11].id,
      },
    }),
    prisma.favoriteDestination.create({
      data: {
        title: "Restaurant Le Meurice",
        address: "228 Rue de Rivoli, 75001 Paris",
        description: "Restaurant gastronomique",
        latitude: 48.8638,
        longitude: 2.3281,
        clientId: clients[11].id,
      },
    }),
  ]);

  console.log("✅ Destinations favorites créées:", favoriteDestinations.length); // ========== TRANSPORTS ==========
  console.log("🚐 Création des transports...");

  // Fonction pour générer des coordonnées réalistes dans Paris et région
  const generateCoordinates = (baseType: "paris" | "suburbs" | "airport") => {
    switch (baseType) {
      case "paris":
        return {
          lat: 48.8566 + (Math.random() - 0.5) * 0.02, // Centre de Paris ±1km
          lng: 2.3522 + (Math.random() - 0.5) * 0.02,
        };
      case "suburbs":
        return {
          lat: 48.8566 + (Math.random() - 0.5) * 0.1, // Banlieue parisienne ±5km
          lng: 2.3522 + (Math.random() - 0.5) * 0.1,
        };
      case "airport":
        return {
          lat: 49.0097 + (Math.random() - 0.5) * 0.005, // CDG Airport
          lng: 2.5479 + (Math.random() - 0.5) * 0.005,
        };
    }
  };

  const transports = [];

  // Transports terminés (historique)
  for (let i = 0; i < 50; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const vehicule = vehicules[Math.floor(Math.random() * 8)]; // Véhicules disponibles
    const chauffeur = chauffeurs.find((c) => c.vehiculeId === vehicule.id);

    if (!chauffeur) continue;

    const depart = generateCoordinates("paris");
    const destination = generateCoordinates(
      Math.random() > 0.8 ? "airport" : "suburbs"
    );
    const distance = Math.random() * 30 + 5; // 5-35 km
    const duree = Math.floor(distance * 2 + Math.random() * 30); // Estimation en minutes
    const montant = distance * 2.5 + vehicule.tarifHoraire * (duree / 60);

    const dateReservation = new Date();
    dateReservation.setDate(
      dateReservation.getDate() - Math.floor(Math.random() * 30)
    ); // Dernier mois

    const transport = await prisma.transport.create({
      data: {
        clientId: client.id,
        vehiculeId: vehicule.id,
        chauffeurId: chauffeur.id,
        dateReservation,
        adresseDepart: `${Math.floor(Math.random() * 200)} Rue Example, Paris`,
        adresseDestination: `${Math.floor(
          Math.random() * 500
        )} Avenue Destination, Paris`,
        departLatitude: depart.lat,
        departLongitude: depart.lng,
        destinationLatitude: destination.lat,
        destinationLongitude: destination.lng,
        distanceEstimee: distance,
        dureeEstimee: duree,
        montantEstime: montant,
        montantFinal: montant * (0.95 + Math.random() * 0.1), // ±5% variation
        heureDepart: new Date(
          dateReservation.getTime() + Math.random() * 86400000
        ), // Dans les 24h
        heureArrivee: new Date(
          dateReservation.getTime() + Math.random() * 86400000 + duree * 60000
        ),
        dureeReelle: duree + Math.floor(Math.random() * 20 - 10), // ±10 minutes
        distanceReelle: distance * (0.95 + Math.random() * 0.1),
        tarifHoraireApplique: vehicule.tarifHoraire,
        status: StatutTransport.TERMINE,
        stripePaymentIntentId: `pi_test_${Math.random()
          .toString(36)
          .substring(7)}`,
        evaluation: Math.floor(Math.random() * 2) + 4, // 4 ou 5 étoiles
        commentaire: Math.random() > 0.7 ? "Excellent service !" : null,
      },
    });

    transports.push(transport);
  }

  // Transports en cours
  for (let i = 0; i < 5; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const vehicule = vehicules[Math.floor(Math.random() * 8)];
    const chauffeur = chauffeurs.find(
      (c) => c.vehiculeId === vehicule.id && c.statutActivite === "ACTIF"
    );

    if (!chauffeur) continue;

    const depart = generateCoordinates("paris");
    const destination = generateCoordinates("suburbs");
    const distance = Math.random() * 20 + 3;
    const duree = Math.floor(distance * 2 + Math.random() * 20);
    const montant = distance * 2.5 + vehicule.tarifHoraire * (duree / 60);

    const currentPos = {
      lat: depart.lat + (destination.lat - depart.lat) * Math.random() * 0.6, // Progression 0-60%
      lng: depart.lng + (destination.lng - depart.lng) * Math.random() * 0.6,
    };

    const dateReservation = new Date();
    dateReservation.setMinutes(
      dateReservation.getMinutes() - Math.floor(Math.random() * 120)
    ); // Il y a 0-2h

    const transport = await prisma.transport.create({
      data: {
        clientId: client.id,
        vehiculeId: vehicule.id,
        chauffeurId: chauffeur.id,
        dateReservation,
        adresseDepart: `${Math.floor(Math.random() * 200)} Rue Départ, Paris`,
        adresseDestination: `${Math.floor(
          Math.random() * 500
        )} Avenue Arrivée, Paris`,
        departLatitude: depart.lat,
        departLongitude: depart.lng,
        destinationLatitude: destination.lat,
        destinationLongitude: destination.lng,
        distanceEstimee: distance,
        dureeEstimee: duree,
        montantEstime: montant,
        tarifHoraireApplique: vehicule.tarifHoraire,
        status: ["EN_ROUTE_RAMASSAGE", "ARRIVE_RAMASSAGE", "EN_COURSE"][
          Math.floor(Math.random() * 3)
        ] as StatutTransport,
        positionActuelle: currentPos,
        heureDepart: new Date(dateReservation.getTime() + 600000), // Départ il y a 10 min
      },
    });

    transports.push(transport);
  }

  // Transports en attente
  for (let i = 0; i < 8; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const vehicule = vehicules[Math.floor(Math.random() * 8)];

    const depart = generateCoordinates("paris");
    const destination = generateCoordinates(
      Math.random() > 0.5 ? "suburbs" : "airport"
    );
    const distance = Math.random() * 25 + 5;
    const duree = Math.floor(distance * 2 + Math.random() * 30);
    const montant = distance * 2.5 + vehicule.tarifHoraire * (duree / 60);

    const dateReservation = new Date();
    dateReservation.setMinutes(
      dateReservation.getMinutes() + Math.floor(Math.random() * 1440)
    ); // Dans les 24h

    const transport = await prisma.transport.create({
      data: {
        clientId: client.id,
        vehiculeId: vehicule.id,
        dateReservation,
        adresseDepart: `${Math.floor(Math.random() * 200)} Rue Futur, Paris`,
        adresseDestination: `${Math.floor(
          Math.random() * 500
        )} Boulevard Futur, Paris`,
        departLatitude: depart.lat,
        departLongitude: depart.lng,
        destinationLatitude: destination.lat,
        destinationLongitude: destination.lng,
        distanceEstimee: distance,
        dureeEstimee: duree,
        montantEstime: montant,
        tarifHoraireApplique: vehicule.tarifHoraire,
        status: StatutTransport.EN_ATTENTE,
      },
    });

    transports.push(transport);
  }

  // Transports validés
  for (let i = 0; i < 3; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const vehicule = vehicules[Math.floor(Math.random() * 8)];
    const chauffeur = chauffeurs.find(
      (c) => c.vehiculeId === vehicule.id && c.statutActivite === "ACTIF"
    );

    if (!chauffeur) continue;

    const depart = generateCoordinates("paris");
    const destination = generateCoordinates("suburbs");
    const distance = Math.random() * 15 + 5;
    const duree = Math.floor(distance * 2 + Math.random() * 20);
    const montant = distance * 2.5 + vehicule.tarifHoraire * (duree / 60);

    const dateReservation = new Date();
    dateReservation.setMinutes(
      dateReservation.getMinutes() + Math.floor(Math.random() * 480)
    ); // Dans les 8h

    const transport = await prisma.transport.create({
      data: {
        clientId: client.id,
        vehiculeId: vehicule.id,
        chauffeurId: chauffeur.id,
        dateReservation,
        adresseDepart: `${Math.floor(Math.random() * 200)} Place Valide, Paris`,
        adresseDestination: `${Math.floor(
          Math.random() * 500
        )} Cours Valide, Paris`,
        departLatitude: depart.lat,
        departLongitude: depart.lng,
        destinationLatitude: destination.lat,
        destinationLongitude: destination.lng,
        distanceEstimee: distance,
        dureeEstimee: duree,
        montantEstime: montant,
        tarifHoraireApplique: vehicule.tarifHoraire,
        status: StatutTransport.VALIDE,
      },
    });

    transports.push(transport);
  }

  console.log("✅ Transports créés:", transports.length);
  // ========== COURSES ==========
  console.log("🚕 Création des courses...");

  const chauffeurIds = chauffeurs.map((c) => c.id);
  const clientIds = clients.map((c) => c.id);
  const courses = [];

  // Courses historiques par mois
  const mois = [
    { nom: "Janvier", date: "2025-01-15", nombre: 20 },
    { nom: "Février", date: "2025-02-15", nombre: 25 },
    { nom: "Mars", date: "2025-03-15", nombre: 30 },
    { nom: "Avril", date: "2025-04-15", nombre: 35 },
    { nom: "Mai", date: "2025-05-15", nombre: 40 },
    { nom: "Juin", date: "2025-06-15", nombre: 45 },
    { nom: "Juillet", date: "2025-07-15", nombre: 50 },
  ];

  for (const mois_data of mois) {
    const coursesMonth = await Promise.all(
      Array(mois_data.nombre)
        .fill(0)
        .map(async (_, i) => {
          const chauffeurId =
            chauffeurIds[Math.floor(Math.random() * chauffeurIds.length)];
          const clientId =
            clientIds[Math.floor(Math.random() * clientIds.length)];
          const price = Math.floor(Math.random() * 30) + 15; // Prix entre 15 et 45€

          return prisma.course.create({
            data: {
              chauffeurId,
              clientId,
              startLocation: `Départ course ${mois_data.nom} ${i + 1}`,
              endLocation: `Arrivée course ${mois_data.nom} ${i + 1}`,
              startTime: new Date(mois_data.date),
              endTime: new Date(mois_data.date),
              estimatedDuration: `${Math.floor(Math.random() * 30) + 10} min`,
              estimatedPrice: price,
              finalPrice: price,
              paymentMethod: ["Carte bancaire", "Espèces", "Mobile Money"][
                Math.floor(Math.random() * 3)
              ],
              status: StatutCourse.TERMINEE,
              typeService: ["DIRECT", "LOCATION", "TRANSPORT"][
                Math.floor(Math.random() * 3)
              ] as any,
            },
          });
        })
    );
    courses.push(...coursesMonth);
  }

  // Courses en cours
  const coursesEnCours = await Promise.all(
    Array(5)
      .fill(0)
      .map(async (_, i) => {
        const chauffeurActifs = chauffeurs.filter(
          (c) => c.statutActivite === "ACTIF"
        );
        const chauffeur =
          chauffeurActifs[Math.floor(Math.random() * chauffeurActifs.length)];
        const clientsActifs = clients.filter((c) => c.statut === "ACTIF");
        const client =
          clientsActifs[Math.floor(Math.random() * clientsActifs.length)];
        const price = Math.floor(Math.random() * 30) + 15;

        return prisma.course.create({
          data: {
            chauffeurId: chauffeur.id,
            clientId: client.id,
            startLocation: `Départ course en cours ${i + 1}`,
            endLocation: `Arrivée course en cours ${i + 1}`,
            startTime: new Date(),
            estimatedDuration: `${Math.floor(Math.random() * 30) + 10} min`,
            currentLocation: "En route vers la destination",
            estimatedPrice: price,
            paymentMethod: ["Carte bancaire", "Espèces", "Mobile Money"][
              Math.floor(Math.random() * 3)
            ],
            status: StatutCourse.EN_COURS,
            typeService: "DIRECT",
          },
        });
      })
  );
  courses.push(...coursesEnCours);

  // Courses planifiées
  const coursesPlanifiees = await Promise.all(
    Array(8)
      .fill(0)
      .map(async (_, i) => {
        const chauffeurActifs = chauffeurs.filter(
          (c) => c.statutActivite === "ACTIF"
        );
        const chauffeur =
          chauffeurActifs[Math.floor(Math.random() * chauffeurActifs.length)];
        const clientsActifs = clients.filter((c) => c.statut === "ACTIF");
        const client =
          clientsActifs[Math.floor(Math.random() * clientsActifs.length)];
        const price = Math.floor(Math.random() * 30) + 15;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        return prisma.course.create({
          data: {
            chauffeurId: chauffeur.id,
            clientId: client.id,
            startLocation: `Départ course planifiée ${i + 1}`,
            endLocation: `Arrivée course planifiée ${i + 1}`,
            startTime: new Date(
              tomorrow.setHours(
                Math.floor(Math.random() * 24),
                Math.floor(Math.random() * 60),
                0
              )
            ),
            estimatedDuration: `${Math.floor(Math.random() * 30) + 10} min`,
            estimatedPrice: price,
            paymentMethod: ["Carte bancaire", "Espèces", "Mobile Money"][
              Math.floor(Math.random() * 3)
            ],
            status: StatutCourse.EN_ATTENTE,
            typeService: "DIRECT",
          },
        });
      })
  );
  courses.push(...coursesPlanifiees);

  console.log("✅ Courses créées:", courses.length);
  // ========== LOCATIONS DE VÉHICULES ==========
  console.log("🏠 Création des locations de véhicules...");

  const locations = await Promise.all([
    // Locations terminées
    ...Array(15)
      .fill(0)
      .map(async (_, i) => {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const vehicule =
          vehicules[Math.floor(Math.random() * vehicules.length)];
        const dateDebut = new Date();
        dateDebut.setDate(dateDebut.getDate() - Math.floor(Math.random() * 30)); // Dernier mois
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 jours

        const jours = Math.ceil(
          (dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)
        );
        const montant = jours * vehicule.tarifJournalier;

        return prisma.locationVehicule.create({
          data: {
            clientId: client.id,
            vehiculeId: vehicule.id,
            dateDebut,
            dateFin,
            lieuDepart: `${Math.floor(
              Math.random() * 200
            )} Rue Location, Paris`,
            lieuDestination: `${Math.floor(
              Math.random() * 500
            )} Avenue Retour, Paris`,
            departLatitude: 48.8566 + (Math.random() - 0.5) * 0.02,
            departLongitude: 2.3522 + (Math.random() - 0.5) * 0.02,
            destinationLatitude: 48.8566 + (Math.random() - 0.5) * 0.02,
            destinationLongitude: 2.3522 + (Math.random() - 0.5) * 0.02,
            distance: Math.random() * 500 + 50, // 50-550 km
            montantTotal: montant,
            status: StatutLocation.TERMINEE,
            stripeCustomerId: client.stripeCustomerId || undefined,
            stripePaymentId: `pi_location_${Math.random()
              .toString(36)
              .substring(7)}`,
            stripeSessionId: `cs_location_${Math.random()
              .toString(36)
              .substring(7)}`,
          },
        });
      }),

    // Locations en cours
    ...Array(3)
      .fill(0)
      .map(async (_, i) => {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const vehicule =
          vehicules[Math.floor(Math.random() * vehicules.length)];
        const dateDebut = new Date();
        dateDebut.setDate(dateDebut.getDate() - Math.floor(Math.random() * 5)); // Commencée dans les 5 derniers jours
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + Math.floor(Math.random() * 5) + 3); // Se termine dans 3-8 jours

        const jours = Math.ceil(
          (dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)
        );
        const montant = jours * vehicule.tarifJournalier;

        return prisma.locationVehicule.create({
          data: {
            clientId: client.id,
            vehiculeId: vehicule.id,
            dateDebut,
            dateFin,
            lieuDepart: `${Math.floor(
              Math.random() * 200
            )} Place Location, Paris`,
            lieuDestination: `${Math.floor(
              Math.random() * 500
            )} Cours Retour, Paris`,
            departLatitude: 48.8566 + (Math.random() - 0.5) * 0.02,
            departLongitude: 2.3522 + (Math.random() - 0.5) * 0.02,
            destinationLatitude: 48.8566 + (Math.random() - 0.5) * 0.02,
            destinationLongitude: 2.3522 + (Math.random() - 0.5) * 0.02,
            distance: Math.random() * 200 + 100, // Estimation en cours
            montantTotal: montant,
            status: StatutLocation.EN_COURS,
            stripeCustomerId: client.stripeCustomerId || undefined,
            stripePaymentId: `pi_location_${Math.random()
              .toString(36)
              .substring(7)}`,
            stripeSessionId: `cs_location_${Math.random()
              .toString(36)
              .substring(7)}`,
          },
        });
      }),

    // Locations confirmées (futures)
    ...Array(5)
      .fill(0)
      .map(async (_, i) => {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const vehicule =
          vehicules[Math.floor(Math.random() * vehicules.length)];
        const dateDebut = new Date();
        dateDebut.setDate(
          dateDebut.getDate() + Math.floor(Math.random() * 14) + 1
        ); // Dans 1-14 jours
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + Math.floor(Math.random() * 10) + 1); // 1-10 jours de location

        const jours = Math.ceil(
          (dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)
        );
        const montant = jours * vehicule.tarifJournalier;

        return prisma.locationVehicule.create({
          data: {
            clientId: client.id,
            vehiculeId: vehicule.id,
            dateDebut,
            dateFin,
            lieuDepart: `${Math.floor(
              Math.random() * 200
            )} Avenue Future, Paris`,
            lieuDestination: `${Math.floor(
              Math.random() * 500
            )} Boulevard Future, Paris`,
            departLatitude: 48.8566 + (Math.random() - 0.5) * 0.02,
            departLongitude: 2.3522 + (Math.random() - 0.5) * 0.02,
            destinationLatitude: 48.8566 + (Math.random() - 0.5) * 0.02,
            destinationLongitude: 2.3522 + (Math.random() - 0.5) * 0.02,
            montantTotal: montant,
            status: StatutLocation.CONFIRMEE,
            stripeCustomerId: client.stripeCustomerId || undefined,
            stripeSessionId: `cs_location_${Math.random()
              .toString(36)
              .substring(7)}`,
          },
        });
      }),
  ]);

  console.log("✅ Locations créées:", locations.length);
  // ========== INCIDENTS ==========
  console.log("⚠️ Création des incidents...");

  const incidents = await Promise.all(
    Array(30)
      .fill(0)
      .map(async (_, i) => {
        const types: TypeIncident[] = [
          "RETARD",
          "PROBLEME_TECHNIQUE",
          "ACCIDENT",
          "LITIGE",
          "AUTRE",
        ];
        const statuts: StatutIncident[] = [
          "NON_RESOLU",
          "EN_COURS_DE_RESOLUTION",
          "RESOLU",
        ];

        return prisma.incident.create({
          data: {
            type: types[Math.floor(Math.random() * types.length)],
            description: `Description détaillée de l'incident ${i + 1}. ${
              types[Math.floor(Math.random() * types.length)] === "RETARD"
                ? "Retard causé par les embouteillages."
                : types[Math.floor(Math.random() * types.length)] ===
                  "PROBLEME_TECHNIQUE"
                ? "Problème technique avec le véhicule."
                : "Autre type d'incident."
            }`,
            status: statuts[Math.floor(Math.random() * statuts.length)],
            courseId:
              Math.random() > 0.3
                ? courses[Math.floor(Math.random() * courses.length)].id
                : undefined,
            chauffeurId:
              Math.random() > 0.5
                ? chauffeurs[Math.floor(Math.random() * chauffeurs.length)].id
                : undefined,
            vehiculeId:
              Math.random() > 0.7
                ? vehicules[Math.floor(Math.random() * vehicules.length)].id
                : undefined,
          },
        });
      })
  );

  console.log("✅ Incidents créés:", incidents.length);

  // ========== DOCUMENTS ==========
  console.log("📄 Création des documents...");

  const documents = await Promise.all(
    Array(25)
      .fill(0)
      .map(async (_, i) => {
        const types: TypeDocument[] = [
          "PERMIS_DE_CONDUIRE",
          "ASSURANCE",
          "CARTE_PROFESSIONNELLE",
          "CONTROLE_TECHNIQUE",
          "AUTRE",
        ];
        const statuts = ["VALIDE", "EN_ATTENTE", "REJETE", "EXPIRE"];
        const chauffeur =
          chauffeurs[Math.floor(Math.random() * chauffeurs.length)];

        const dateExpiration = new Date();
        dateExpiration.setMonth(
          dateExpiration.getMonth() + Math.floor(Math.random() * 24)
        ); // Expire dans 0-24 mois

        return prisma.document.create({
          data: {
            nom: `Document ${
              types[Math.floor(Math.random() * types.length)]
            } - ${chauffeur.nom}`,
            type: types[Math.floor(Math.random() * types.length)],
            fichier: `document_${i + 1}_${chauffeur.id}.pdf`,
            mimeType: "application/pdf",
            taille: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
            dateExpiration: Math.random() > 0.2 ? dateExpiration : null, // 80% ont une date d'expiration
            status: statuts[Math.floor(Math.random() * statuts.length)],
            chauffeurId: chauffeur.id,
          },
        });
      })
  );

  console.log("✅ Documents créés:", documents.length);

  // ========== MAINTENANCES ==========
  console.log("🔧 Création des maintenances...");

  const maintenances = await Promise.all(
    Array(35)
      .fill(0)
      .map(async (_, i) => {
        const types = [
          "Vidange",
          "Révision générale",
          "Changement pneus",
          "Réparation freins",
          "Entretien climatisation",
          "Contrôle technique",
          "Réparation moteur",
          "Carrosserie",
        ];
        const statuts: StatutMaintenance[] = [
          "TERMINE",
          "EN_COURS",
          "PLANIFIE",
          "ANNULE",
        ];
        const vehicule =
          vehicules[Math.floor(Math.random() * vehicules.length)];

        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Dans les 6 derniers mois
        const cout = Math.floor(Math.random() * 1500) + 50; // 50-1550€
        const type = types[Math.floor(Math.random() * types.length)];

        return prisma.maintenance.create({
          data: {
            date,
            type,
            description: `${type} effectué${
              type.includes("Réparation") ? "e" : ""
            } sur ${vehicule.marque} ${vehicule.modele}. ${
              Math.random() > 0.5
                ? "Maintenance préventive."
                : "Intervention suite à un problème détecté."
            }`,
            cout,
            kilometrage:
              vehicule.kilometrage + Math.floor(Math.random() * 5000), // Kilométrage au moment de la maintenance
            statut: statuts[Math.floor(Math.random() * statuts.length)],
            vehiculeId: vehicule.id,
          },
        });
      })
  );

  console.log("✅ Maintenances créées:", maintenances.length);

  console.log("Seeding terminé avec succès!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
