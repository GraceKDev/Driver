using Amazon;
using Amazon.S3;
using Amazon.S3.Model;

namespace ChaosDrive.Api.Storage;

public record PresignedUpload(string Url, DateTime ExpiresAt);

public record StoredObject(long SizeBytes, string? ContentType);

public interface IFileStorage
{
    PresignedUpload CreateUploadUrl(string key, string contentType);
    string CreateDownloadUrl(string key, string fileName);
    Task<StoredObject?> GetMetadataAsync(string key, CancellationToken cancellationToken = default);
    Task DeleteAsync(string key, CancellationToken cancellationToken = default);
}

public sealed class S3FileStorage : IFileStorage
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucket;

    public S3FileStorage(IAmazonS3 s3, IConfiguration configuration)
    {
        _s3 = s3;
        _bucket = configuration["AWS:BucketName"]
            ?? throw new InvalidOperationException("AWS:BucketName is not configured.");
    }

    public PresignedUpload CreateUploadUrl(string key, string contentType)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(15);
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucket,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = expiresAt,
            ContentType = contentType
        };

        return new PresignedUpload(_s3.GetPreSignedURL(request), expiresAt);
    }

    public string CreateDownloadUrl(string key, string fileName)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucket,
            Key = key,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddMinutes(5),
            ResponseHeaderOverrides = new ResponseHeaderOverrides
            {
                ContentDisposition = $"attachment; filename*=UTF-8''{Uri.EscapeDataString(fileName)}"
            }
        };

        return _s3.GetPreSignedURL(request);
    }

    public async Task<StoredObject?> GetMetadataAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var metadata = await _s3.GetObjectMetadataAsync(_bucket, key, cancellationToken);
            return new StoredObject(metadata.ContentLength, metadata.Headers.ContentType);
        }
        catch (AmazonS3Exception exception) when (exception.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task DeleteAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _s3.DeleteObjectAsync(_bucket, key, cancellationToken);
        }
        catch (AmazonS3Exception exception) when (exception.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Already gone; deleting is idempotent.
        }
    }
}
