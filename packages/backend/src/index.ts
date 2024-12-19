import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

// search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));

// search engine
backend.add(import('@backstage/plugin-search-backend-module-pg/alpha'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend/alpha'));

// --------------- Customization start --------------- //
import { stringifyEntityRef } from '@backstage/catalog-model';

// auth
import { createBackendModule } from '@backstage/backend-plugin-api';
import { gitlabAuthenticator } from '@backstage/plugin-auth-backend-module-gitlab-provider';
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';

const customGitLabAuth = createBackendModule({
  pluginId: 'auth',
  moduleId: 'custom-gitlab-auth-provider',
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'gitlab',
          factory: createOAuthProviderFactory({
            authenticator: gitlabAuthenticator,
            async signInResolver(info, ctx) {
              const { profile: { email } } = info;
              if (!email) {
                throw new Error('User profile contained no email');
              }
              const [userId] = email.split('@');
	      
	            const userEntity = stringifyEntityRef({
                kind: 'User',
                name: userId,
                namespace: 'default',
              });
	      
	            return ctx.issueToken({
                claims: {
                  sub: userEntity,
                  ent: [userEntity],
                },
              });
	          },
          }),
        });
      },
    });
  },
});
backend.add(customGitLabAuth);

// scaffolder
// Instruction from https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend-module-cookiecutter
backend.add(import('@backstage/plugin-scaffolder-backend-module-cookiecutter'));

// Add abuility to publish to gitlab
backend.add(import('@backstage/plugin-scaffolder-backend-module-gitlab'));

// --------------- Customization end --------------- //

backend.start();
