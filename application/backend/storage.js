import { S3Client, CreateBucketCommand, HeadBucketCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Stockage des états des lieux dans un service compatible S3.
 * Le contrat d'intégration avec le S3 cible reste à établir : seules les
 * opérations élémentaires (dépôt et lecture d'un objet) sont utilisées.
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
    destroy() {},
  };
}
