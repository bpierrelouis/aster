import { S3Client, CreateBucketCommand, HeadBucketCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** Durée de validité d'un lien de téléchargement signé, en secondes. */
const SIGNED_URL_TTL = 60;

/**
 * Stockage des états des lieux dans un service compatible S3.
 * Le contrat d'intégration avec le S3 cible reste à établir : seules les
 * opérations élémentaires (dépôt, lecture et lien de lecture signé) sont utilisées.
 * Le navigateur télécharge le document par le lien signé, sans transit par le serveur.
 */
export function createS3Storage({ endpoint, region, bucket, accessKeyId, secretAccessKey }) {
  const client = new S3Client({ endpoint, region, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } });
  let ready;
  const ensureBucket = () => (ready ??= client.send(new HeadBucketCommand({ Bucket: bucket }))
    .catch((error) => {
      if (error.$metadata?.httpStatusCode !== 404 && error.name !== 'NotFound') throw error;
      return client.send(new CreateBucketCommand({ Bucket: bucket }));
    })
    .catch((error) => { ready = undefined; throw error; }));
  return {
    bucket,
    ensureBucket,
    async put(key, body, contentType = 'application/pdf') {
      await ensureBucket();
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
    },
    async get(key) {
      await ensureBucket();
      const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      return Buffer.from(await response.Body.transformToByteArray());
    },
    signedUrl(key, filename) {
      return getSignedUrl(client, new GetObjectCommand({
        Bucket: bucket, Key: key,
        ResponseContentType: 'application/pdf',
        ResponseContentDisposition: `inline; filename="${filename}"`,
      }), { expiresIn: SIGNED_URL_TTL });
    },
    destroy: () => client.destroy(),
  };
}

/** Stockage en mémoire, pour les tests unitaires. */
export function createMemoryStorage() {
  const objects = new Map();
  return {
    bucket: 'memoire',
    objects,
    ensureBucket: async () => {},
    async put(key, body) { objects.set(key, Buffer.from(body)); },
    async get(key) { if (!objects.has(key)) throw Object.assign(new Error('Objet introuvable.'), { name: 'NoSuchKey' }); return objects.get(key); },
    async signedUrl(key) { return `memoire:///${key}`; },
    destroy() {},
  };
}
