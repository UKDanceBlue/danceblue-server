const { faker } = require("@faker-js/faker");

type PersonModelJson = InferCreationAttributes<PersonModel>;

const usersSeeder: Migration = {
  async up(queryInterface: AbstractQueryInterface, Sequelize) {
    const personData: PersonModelJson[] = [];
    for (let i = 0; i < 100; i++) {
      const firstName = faker.name.firstName();
      const middleName = faker.name.middleName();
      const lastName = faker.name.lastName();
      const isUky = faker.datatype.boolean();
      const email = faker.internet.email(
        firstName,
        lastName,
        isUky ? "uky.edu" : undefined
      );
      let linkblue: string | undefined;
      if (isUky) {
        const threeDigitNumber = faker.datatype.number({ min: 100, max: 999 });
        linkblue = `${firstName[0]}${middleName[0]}${lastName[0]}${lastName[1]}${threeDigitNumber}`;
      }

      personData.push({
        firstName,
        lastName,
        email,
        linkblue: linkblue ?? null,
      });
    }

    await queryInterface.bulkInsert("People", personData);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};

export default usersSeeder;
