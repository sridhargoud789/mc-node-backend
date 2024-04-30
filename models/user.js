const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
    static associate(models) {
      // define association here
      this.belongsTo(models.languages, {foreignKey: 'language_id'});
      this.belongsTo(models.levels, {foreignKey: 'level_id', as: 'levels'});
      this.belongsTo(models.roles, {foreignKey: 'role_id', as: 'roles'});
      this.hasMany(models.users_wallets, {foreignKey: 'user_id', as: 'userWallets'});
      this.hasOne(models.users_notifications, {foreignKey: 'user_id', as: 'notificationSettings'});
      this.hasOne(models.mc_wallets, {foreignKey: 'user_id', as: 'mcWalletData'});

    }
  }
  User.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
        },
        email: {
          type: DataTypes.STRING,
        },
        email_verified_at: {
          type: DataTypes.DATE,
        },
        phone_number: {
          type: DataTypes.TEXT,
        },
        is_phone_verified: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0,
        },
        password: {
          type: DataTypes.STRING,
        },
        two_factor_secret: {
          type: DataTypes.STRING,
        },
        two_factor_recovery_codes: {
          type: DataTypes.STRING,
        },
        date_birth: {
          type: DataTypes.STRING,
        },
        gender: {
          type: DataTypes.STRING,
        },
        adult: {
          type: DataTypes.INTEGER,
        },
        accept_private_policy: {
          type: DataTypes.INTEGER,
        },
        token: {
          type: DataTypes.STRING,
        },
        remember_token: {
          type: DataTypes.STRING,
        },
        role_id: {
          type: DataTypes.BIGINT,
        },
        level_id: {
          type: DataTypes.BIGINT,
        },
        language_id: {
          type: DataTypes.BIGINT,
        },
        newsletter_id: {
          type: DataTypes.BIGINT,
        },
        created_at: {
          type: DataTypes.DATE,
        },
        updated_at: {
          type: DataTypes.DATE,
        },
        deleted_at: {
          type: DataTypes.DATE,
        },
        avatar: {
          type: DataTypes.STRING,
        },

        last_name: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        address_line1: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        address_line2: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        state: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        country: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        twitter: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        facebook: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        instagram: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        linkedin: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        youtube: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        confirm_email_token: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        active_campagin_id: {
          type: DataTypes.NUMBER,
          defaultValue: null
        },
        discord_username: {
          type: DataTypes.STRING,
          defaultValue: null,
        },
        insta_user_id: {
          type: DataTypes.STRING,
          defaultValue: ''
        },
        employee_company: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_1_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_2_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_3_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_4_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_5_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_6_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_7_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_8_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_9_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_10_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_11_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_12_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_13_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        is_module_14_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        },
        telegram_username_submitted: {
          type: DataTypes.TINYINT(1),
          defaultValue: null,
        }
      },
      {
        sequelize,
        modelName: 'users',
        timestamps: false,
      },
  );
  return User;
};
