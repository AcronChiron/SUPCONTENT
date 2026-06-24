import { PrismaClient, MediaType, LibraryStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_PASSWORD = 'Test1234!';

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@supcontent.test' },
    update: {},
    create: {
      email: 'admin@supcontent.test',
      username: 'admin',
      passwordHash,
      role: Role.ADMIN,
      bio: 'Compte administrateur de test',
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@supcontent.test' },
    update: {},
    create: {
      email: 'alice@supcontent.test',
      username: 'alice',
      passwordHash,
      role: Role.USER,
      bio: "Fan de rock et d'electro",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@supcontent.test' },
    update: {},
    create: {
      email: 'bob@supcontent.test',
      username: 'bob',
      passwordHash,
      role: Role.USER,
      bio: 'Toujours à la recherche de nouvelles sorties',
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@supcontent.test' },
    update: {},
    create: {
      email: 'carol@supcontent.test',
      username: 'carol',
      passwordHash,
      role: Role.USER,
      bio: 'Critique musicale amateur',
    },
  });

  const banned = await prisma.user.upsert({
    where: { email: 'banned@supcontent.test' },
    update: {},
    create: {
      email: 'banned@supcontent.test',
      username: 'banned_user',
      passwordHash,
      role: Role.USER,
      isBanned: true,
      bio: 'Compte banni pour tester la modération',
    },
  });

  // Follows (mutuel entre alice/bob pour tester les messages)
  await prisma.follow.upsert({
    where: { followerId_followedId: { followerId: alice.id, followedId: bob.id } },
    update: {},
    create: { followerId: alice.id, followedId: bob.id },
  });
  await prisma.follow.upsert({
    where: { followerId_followedId: { followerId: bob.id, followedId: alice.id } },
    update: {},
    create: { followerId: bob.id, followedId: alice.id },
  });
  await prisma.follow.upsert({
    where: { followerId_followedId: { followerId: carol.id, followedId: alice.id } },
    update: {},
    create: { followerId: carol.id, followedId: alice.id },
  });

  // Library items
  await prisma.libraryItem.upsert({
    where: { userId_externalId: { userId: alice.id, externalId: 'artist-radiohead' } },
    update: {},
    create: {
      userId: alice.id,
      externalId: 'artist-radiohead',
      mediaType: MediaType.ARTIST,
      status: LibraryStatus.DONE,
      rating: 5,
      notes: 'Groupe culte',
    },
  });
  await prisma.libraryItem.upsert({
    where: { userId_externalId: { userId: bob.id, externalId: 'album-ok-computer' } },
    update: {},
    create: {
      userId: bob.id,
      externalId: 'album-ok-computer',
      mediaType: MediaType.ALBUM,
      status: LibraryStatus.LISTENING,
      rating: 4,
    },
  });

  // Custom list
  const list = await prisma.customList.create({
    data: {
      userId: alice.id,
      name: 'Mes classiques du rock',
      description: 'Une sélection de mes albums préférés',
      isPublic: true,
      items: {
        create: [
          { externalId: 'album-ok-computer', mediaType: MediaType.ALBUM, position: 0 },
          { externalId: 'artist-radiohead', mediaType: MediaType.ARTIST, position: 1 },
        ],
      },
    },
  });

  // Review + comment + like
  const review = await prisma.review.upsert({
    where: { userId_externalId: { userId: bob.id, externalId: 'album-ok-computer' } },
    update: {},
    create: {
      userId: bob.id,
      externalId: 'album-ok-computer',
      mediaType: MediaType.ALBUM,
      content: 'Un album incontournable, chaque écoute révèle de nouveaux détails.',
      rating: 5,
      containsSpoiler: false,
      isFeatured: true,
    },
  });

  await prisma.comment.create({
    data: {
      userId: alice.id,
      reviewId: review.id,
      content: "Totalement d'accord, mon album préféré aussi !",
    },
  });

  await prisma.like.upsert({
    where: { userId_reviewId: { userId: carol.id, reviewId: review.id } },
    update: {},
    create: { userId: carol.id, reviewId: review.id },
  });

  // Message (alice <-> bob, suivi mutuel)
  await prisma.message.create({
    data: {
      senderId: alice.id,
      receiverId: bob.id,
      content: 'Salut, tu as écouté le dernier album dont tu parlais ?',
    },
  });
  await prisma.message.create({
    data: {
      senderId: bob.id,
      receiverId: alice.id,
      content: 'Oui carrément, je viens de poster une critique !',
    },
  });

  // Notification
  await prisma.notification.create({
    data: {
      userId: bob.id,
      type: 'like',
      payload: { reviewId: review.id, fromUserId: carol.id },
    },
  });

  console.log('Seed terminé.');
  console.log('Comptes de test (mot de passe pour tous : Test1234!) :');
  console.log('  - admin@supcontent.test (ADMIN)');
  console.log('  - alice@supcontent.test');
  console.log('  - bob@supcontent.test');
  console.log('  - carol@supcontent.test');
  console.log('  - banned@supcontent.test (banni)');
  console.log(`Liste créée : "${list.name}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
