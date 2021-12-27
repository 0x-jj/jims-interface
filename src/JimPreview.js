import { Image, Space } from 'antd';

export function JimPreview({ metadata }) {
  const ipfsUrl = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
  return (
    <div>
      <Space size={12}>
        <Image width={200} src={ipfsUrl} />
        <div>
          <strong>
            <u>{metadata.name}</u>
          </strong>
          <div>
            {metadata.attributes.map((attribute) => (
              <div>
                <strong>{attribute.trait_type}:</strong> {attribute.value}
              </div>
            ))}
          </div>
        </div>
      </Space>
    </div>
  );
}
