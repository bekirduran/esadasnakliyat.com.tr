-- Preserve existing regional content and requests when renaming the storage service.
UPDATE locations
SET path = REPLACE(path, '/hizmetler/esya-depolama-2/', '/hizmetler/esya-depolama/')
WHERE path LIKE '/hizmetler/esya-depolama-2/%';
UPDATE leads SET service = 'esya-depolama' WHERE service = 'esya-depolama-2';
