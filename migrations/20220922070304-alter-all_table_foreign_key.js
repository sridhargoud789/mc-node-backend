'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addConstraint('users', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'users_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('users', {
        fields: ['level_id'],
        type: 'foreign key',
        name: 'users_level_id_foreign',
        references: {
          table: 'levels',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('users', {
        fields: ['newsletter_id'],
        type: 'foreign key',
        name: 'users_newsletter_id_foreign',
        references: {
          table: 'newsletters',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('users', {
        fields: ['role_id'],
        type: 'foreign key',
        name: 'users_role_id_foreign',
        references: {
          table: 'roles',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('api_sparkline_cryptos', {
        fields: ['api_crypto_id'],
        type: 'foreign key',
        name: 'api_sparkline_cryptos_api_crypto_id_foreign',
        references: {
          table: 'api_cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('weekly_analysis_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'weekly_analysis_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('weekly_analysis_languages', {
        fields: ['weekly_analysis_id'],
        type: 'foreign key',
        name: 'weekly_analysis_languages_weekly_analysis_id_foreign',
        references: {
          table: 'weekly_analyses',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('weekly_analyses', {
        fields: ['author_id'],
        type: 'foreign key',
        name: 'weekly_analyses_author_id_foreign',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('weekly_analyses', {
        fields: ['status_id'],
        type: 'foreign key',
        name: 'weekly_analyses_status_id_foreign',
        references: {
          table: 'statuses',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('week_crypto', {
        fields: ['api_crypto_id'],
        type: 'foreign key',
        name: 'week_cryptos_api_crypto_id_foreign',
        references: {
          table: 'api_cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('week_crypto', {
        fields: ['author_id'],
        type: 'foreign key',
        name: 'week_cryptos_author_id_foreign',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('week_crypto', {
        fields: ['status_id'],
        type: 'foreign key',
        name: 'week_cryptos_status_id_foreign',
        references: {
          table: 'statuses',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('week_crypto_tags', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'week_crypto_tags_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('week_crypto_tags', {
        fields: ['tag_id'],
        type: 'foreign key',
        name: 'week_crypto_tags_tag_id_foreign',
        references: {
          table: 'tags',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      // await queryInterface.addConstraint('week_crypto_tags', {
      // 	fields: ['week_crypto_id'],
      // 	type: 'foreign key',
      // 	name: 'week_crypto_tags_week_crypto_id_foreign',
      // 	references: {
      // 		table: 'week_cryptos',
      // 		field: 'id',
      // 	},
      // 	onDelete: 'cascade',
      // 	onUpdate: 'cascade',
      // })
      await queryInterface.addConstraint('week_crypto_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'week_crypto_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      // await queryInterface.addConstraint('week_crypto_languages', {
      // 	fields: ['week_crypto_id'],
      // 	type: 'foreign key',
      // 	name: 'week_crypto_languages_week_crypto_id_foreign',
      // 	references: {
      // 		table: 'week_cryptos',
      // 		field: 'id',
      // 	},
      // 	onDelete: 'cascade',
      // 	onUpdate: 'cascade',
      // })
      await queryInterface.addConstraint('user_cryptos', {
        fields: ['api_crypto_id'],
        type: 'foreign key',
        name: 'user_cryptos_api_crypto_id_foreign',
        references: {
          table: 'api_cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('user_cryptos', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'user_cryptos_user_id_foreign',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('trending_topics_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'trending_topic_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      // await queryInterface.addConstraint('trending_topics_languages', {
      // 	fields: ['trending_topics_id'],
      // 	type: 'foreign key',
      // 	name: 'trending_topic_languages_trending_topic_id_foreign',
      // 	references: {
      // 		table: 'trending_topics',
      // 		field: 'id',
      // 	},
      // 	onDelete: 'cascade',
      // 	onUpdate: 'cascade',
      // })
      await queryInterface.addConstraint('tokenomics_wallet', {
        fields: ['tokenomic_id'],
        type: 'foreign key',
        name: 'tokenomic_wallets_tokenomic_id_foreign',
        references: {
          table: 'tokenomics',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tokenomics_explorer', {
        fields: ['tokenomic_id'],
        type: 'foreign key',
        name: 'tokenomic_explorers_tokenomic_id_foreign',
        references: {
          table: 'tokenomics',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tokenomics_details', {
        fields: ['tokenomic_id'],
        type: 'foreign key',
        name: 'tokenomic_details_tokenomic_id_foreign',
        references: {
          table: 'tokenomics',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tokenomics_communities', {
        fields: ['tokenomic_id'],
        type: 'foreign key',
        name: 'tokenomic_communities_tokenomic_id_foreign',
        references: {
          table: 'tokenomics',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('articles', {
        fields: ['api_crypto_id'],
        type: 'foreign key',
        name: 'articles_api_crypto_id_foreign',
        references: {
          table: 'api_cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('articles', {
        fields: ['author_id'],
        type: 'foreign key',
        name: 'articles_author_id_foreign',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('articles', {
        fields: ['category_id'],
        type: 'foreign key',
        name: 'articles_category_id_foreign',
        references: {
          table: 'article_categories',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('articles', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'articles_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('articles', {
        fields: ['level_id'],
        type: 'foreign key',
        name: 'articles_level_id_foreign',
        references: {
          table: 'levels',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('articles', {
        fields: ['status_id'],
        type: 'foreign key',
        name: 'articles_status_id_foreign',
        references: {
          table: 'statuses',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_categories', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'article_categories_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_category_languages', {
        fields: ['category_id'],
        type: 'foreign key',
        name: 'article_category_languages_category_id_foreign',
        references: {
          table: 'article_categories',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_category_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'article_category_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_images', {
        fields: ['article_id'],
        type: 'foreign key',
        name: 'article_images_article_id_foreign',
        references: {
          table: 'articles',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_languages', {
        fields: ['article_id'],
        type: 'foreign key',
        name: 'article_languages_article_id_foreign',
        references: {
          table: 'articles',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'article_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_tags', {
        fields: ['article_id'],
        type: 'foreign key',
        name: 'article_tags_article_id_foreign',
        references: {
          table: 'articles',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_tags', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'article_tags_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('article_tags', {
        fields: ['tag_id'],
        type: 'foreign key',
        name: 'article_tags_tag_id_foreign',
        references: {
          table: 'tags',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('cryptos', {
        fields: ['api_crypto_id'],
        type: 'foreign key',
        name: 'cryptos_api_crypto_id_foreign',
        references: {
          table: 'api_cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('cryptos', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'cryptos_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('cryptos', {
        fields: ['tag_id'],
        type: 'foreign key',
        name: 'cryptos_tag_id_foreign',
        references: {
          table: 'tags',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('crypto_communities', {
        fields: ['crypto_id'],
        type: 'foreign key',
        name: 'crypto_communities_crypto_id_foreign',
        references: {
          table: 'cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('crypto_explorers', {
        fields: ['crypto_id'],
        type: 'foreign key',
        name: 'crypto_explorers_crypto_id_foreign',
        references: {
          table: 'cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('crypto_wallets', {
        fields: ['crypto_id'],
        type: 'foreign key',
        name: 'crypto_wallets_crypto_id_foreign',
        references: {
          table: 'cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notices', {
        fields: ['api_crypto_id'],
        type: 'foreign key',
        name: 'notices_api_crypto_id_foreign',
        references: {
          table: 'api_cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notices', {
        fields: ['author_id'],
        type: 'foreign key',
        name: 'notices_author_id_foreign',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notices', {
        fields: ['category_id'],
        type: 'foreign key',
        name: 'notices_category_id_foreign',
        references: {
          table: 'notice_categories',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notices', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'notices_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notices', {
        fields: ['status_id'],
        type: 'foreign key',
        name: 'notices_status_id_foreign',
        references: {
          table: 'statuses',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notices', {
        fields: ['subcategory_id'],
        type: 'foreign key',
        name: 'notices_subcategory_id_foreign',
        references: {
          table: 'notice_subcategories',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_categories', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'notice_categories_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_category_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'notice_category_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_category_languages', {
        fields: ['category_id'],
        type: 'foreign key',
        name: 'notice_category_languages_category_id_foreign',
        references: {
          table: 'notice_categories',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_images', {
        fields: ['notice_id'],
        type: 'foreign key',
        name: 'notice_images_notice_id_foreign',
        references: {
          table: 'notices',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_languages', {
        fields: ['notice_id'],
        type: 'foreign key',
        name: 'notice_languages_notice_id_foreign',
        references: {
          table: 'notices',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'notice_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_subcategories', {
        fields: ['category_id'],
        type: 'foreign key',
        name: 'notice_subcategories_category_id_foreign',
        references: {
          table: 'notice_categories',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_subcategories', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'notice_subcategories_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_subcategory_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'notice_subcategory_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notice_subcategory_languages', {
        fields: ['subcategory_id'],
        type: 'foreign key',
        name: 'notice_subcategory_languages_subcategory_id_foreign',
        references: {
          table: 'notice_subcategories',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });

      await queryInterface.addConstraint('notices_tags', {
        fields: ['notice_id'],
        type: 'foreign key',
        name: 'notice_tags_notice_id_foreign',
        references: {
          table: 'notices',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notices_tags', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'notice_tags_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('notices_tags', {
        fields: ['tag_id'],
        type: 'foreign key',
        name: 'notice_tags_tag_id_foreign',
        references: {
          table: 'tags',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('pages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'pages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('pages', {
        fields: ['template_id'],
        type: 'foreign key',
        name: 'pages_template_id_foreign',
        references: {
          table: 'templates',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('subscibed_users', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'subscribed_users_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('subscibed_users', {
        fields: ['newsletter_id'],
        type: 'foreign key',
        name: 'subscribed_users_newsletter_id_foreign',
        references: {
          table: 'newsletters',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tags', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'tags_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tags', {
        fields: ['tag_type_id'],
        type: 'foreign key',
        name: 'tags_tag_type_id_foreign',
        references: {
          table: 'tag_types',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tag_languages', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'tag_languages_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tag_languages', {
        fields: ['tag_id'],
        type: 'foreign key',
        name: 'tag_languages_tag_id_foreign',
        references: {
          table: 'tags',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('team_invitations', {
        fields: ['team_id'],
        type: 'foreign key',
        name: 'team_invitations_team_id_foreign',
        references: {
          table: 'teams',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      // await queryInterface.addConstraint('team_invitations', {
      // 	fields: ['tag_id'],
      // 	type: 'foreign key',
      // 	name: 'tag_languages_tag_id_foreign',
      // 	references: {
      // 		table: 'tags',
      // 		field: 'id',
      // 	},
      // 	onDelete: 'cascade',
      // 	onUpdate: 'cascade',
      // })
      await queryInterface.addConstraint('tokenomics', {
        fields: ['api_crypto_id'],
        type: 'foreign key',
        name: 'tokenomics_api_crypto_id_foreign',
        references: {
          table: 'api_cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tokenomics', {
        fields: ['crypto_id'],
        type: 'foreign key',
        name: 'tokenomics_ibfk_1',
        references: {
          table: 'cryptos',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('tokenomics', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'tokenomics_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('weekly_analysis_tags', {
        fields: ['language_id'],
        type: 'foreign key',
        name: 'weekly_analysis_tags_language_id_foreign',
        references: {
          table: 'languages',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      // await queryInterface.addConstraint('weekly_analysis_tags', {
      // 	fields: ['weekly_analysis_id'],
      // 	type: 'foreign key',
      // 	name: 'weekly_analysis_tags_weekly_analysis_tag_id_foreign',
      // 	references: {
      // 		table: 'weekly_analyses',
      // 		field: 'id',
      // 	},
      // 	onDelete: 'cascade',
      // 	onUpdate: 'cascade',
      // })
      await queryInterface.addConstraint('weekly_analysis_tags', {
        fields: ['tag_id'],
        type: 'foreign key',
        name: 'weekly_analysis_tags_tag_id_foreign',
        references: {
          table: 'tags',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
      await queryInterface.addConstraint('user_wallets', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'wallets_user_id_foreign',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      });
    } catch (err) {
      console.log('err', err);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
        'users',
        'users_language_id_foreign',
    );
    await queryInterface.removeConstraint('users', 'users_level_id_foreign');
    await queryInterface.removeConstraint(
        'users',
        'users_newsletter_id_foreign',
    );
    await queryInterface.removeConstraint('users', 'users_role_id_foreign');
    await queryInterface.removeConstraint(
        'api_sparkline_cryptos',
        'api_sparkline_cryptos_api_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'weekly_analysis_languages',
        'weekly_analysis_languages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'weekly_analysis_languages',
        'weekly_analysis_languages_weekly_analysis_id_foreign',
    );
    await queryInterface.removeConstraint(
        'weekly_analyses',
        'weekly_analyses_author_id_foreign',
    );
    await queryInterface.removeConstraint(
        'weekly_analyses',
        'weekly_analyses_status_id_foreign',
    );
    await queryInterface.removeConstraint(
        'week_crypto',
        'week_cryptos_api_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'week_crypto',
        'week_cryptos_author_id_foreign',
    );
    await queryInterface.removeConstraint(
        'week_crypto',
        'week_cryptos_status_id_foreign',
    );
    await queryInterface.removeConstraint(
        'week_crypto_tags',
        'week_crypto_tags_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'week_crypto_tags',
        'week_crypto_tags_tag_id_foreign',
    );
    await queryInterface.removeConstraint(
        'week_crypto_tags',
        'week_crypto_tags_week_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'week_crypto_languages',
        'week_crypto_languages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'week_crypto_languages',
        'week_crypto_languages_week_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'user_cryptos',
        'user_cryptos_api_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'user_cryptos',
        'user_cryptos_user_id_foreign',
    );
    await queryInterface.removeConstraint(
        'trending_topics_languages',
        'trending_topic_languages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'trending_topics_languages',
        'trending_topic_languages_trending_topic_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tokenomics_wallet',
        'tokenomic_wallets_tokenomic_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tokenomics_explorer',
        'tokenomic_explorers_tokenomic_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tokenomics_details',
        'tokenomic_details_tokenomic_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tokenomics_communities',
        'tokenomic_communities_tokenomic_id_foreign',
    );
    await queryInterface.removeConstraint(
        'articles',
        'articles_api_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'articles',
        'articles_author_id_foreign',
    );
    await queryInterface.removeConstraint(
        'articles',
        'articles_category_id_foreign',
    );
    await queryInterface.removeConstraint(
        'articles',
        'articles_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'articles',
        'articles_level_id_foreign',
    );
    await queryInterface.removeConstraint(
        'articles',
        'articles_status_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_categories',
        'article_categories_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_category_languages',
        'article_category_languages_category_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_category_languages',
        'article_category_languages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_images',
        'article_images_article_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_languages',
        'article_languages_article_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_languages',
        'article_languages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_tags',
        'article_tags_article_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_tags',
        'article_tags_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'article_tags',
        'article_tags_tag_id_foreign',
    );
    await queryInterface.removeConstraint(
        'cryptos',
        'cryptos_api_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'cryptos',
        'cryptos_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'cryptos',
        'cryptos_tag_id_foreign',
    );
    await queryInterface.removeConstraint(
        'crypto_communities',
        'crypto_communities_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'crypto_explorers',
        'crypto_explorers_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'crypto_wallets',
        'crypto_wallets_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notices_api_crypto_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notices_author_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notices_category_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notices_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notices_status_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notices_subcategory_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notice_categories_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notice_category_languages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices',
        'notice_category_languages_category_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notice_images',
        'notice_images_notice_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notice_languages',
        'notice_languages_notice_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notice_languages',
        'notice_languages_notice_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notice_subcategories',
        'notice_subcategories_category_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notice_subcategories',
        'notice_subcategories_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notice_subcategory_languages',
        'notice_subcategory_languages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notice_subcategory_languages',
        'notice_subcategory_languages_subcategory_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices_tags',
        'notice_tags_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices_tags',
        'notice_tags_notice_id_foreign',
    );
    await queryInterface.removeConstraint(
        'notices_tags',
        'notice_tags_tag_id_foreign',
    );
    await queryInterface.removeConstraint(
        'pages',
        'pages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'pages',
        'pages_template_id_foreign',
    );
    await queryInterface.removeConstraint(
        'subscibed_users',
        'subscribed_users_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'subscibed_users',
        'subscribed_users_newsletter_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tags',
        'tags_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tags',
        'tags_tag_type_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tag_languages',
        'tag_languages_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tag_languages',
        'tag_languages_tag_id_foreign',
    );
    await queryInterface.removeConstraint(
        'team_invitations',
        'team_invitations_team_id_foreign',
    );
    await queryInterface.removeConstraint(
        'team_invitations',
        'tag_languages_tag_id_foreign',
    );
    await queryInterface.removeConstraint(
        'tokenomics',
        'tokenomics_api_crypto_id_foreign',
    );
    await queryInterface.removeConstraint('tokenomics', 'tokenomics_ibfk_1');
    await queryInterface.removeConstraint(
        'tokenomics',
        'tokenomics_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'weekly_analysis_tags',
        'weekly_analysis_tags_language_id_foreign',
    );
    await queryInterface.removeConstraint(
        'weekly_analysis_tags',
        'weekly_analysis_tags_weekly_analysis_tag_id_foreign',
    );
    await queryInterface.removeConstraint(
        'weekly_analysis_tags',
        'weekly_analysis_tags_tag_id_foreign',
    );
    await queryInterface.removeConstraint(
        'user_wallets',
        'wallets_user_id_foreign',
    );
  },
};
