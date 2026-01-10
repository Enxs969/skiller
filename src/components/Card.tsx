import { ReactNode, memo } from 'react';
import './Card.css';

interface CardProps {
  name: string;
  description: string;
  downloads?: number;
  stars?: number;
  tags?: string[];
  isInstalled?: boolean;
  actions?: ReactNode;
}

export const Card = memo(function Card({ name, description, downloads, stars, tags, isInstalled, actions }: CardProps) {
  return (
    <div className={`card ${isInstalled ? 'card-installed' : ''}`}>
      <div className="card-header">
        <h3 className="card-name">
          {name}
          {isInstalled && <span className="card-installed-badge">Installed</span>}
        </h3>
        <div className="card-stats">
          {downloads !== undefined && (
            <span className="card-stat" title="Downloads">
              <DownloadIcon />
              {formatNumber(downloads)}
            </span>
          )}
          {stars !== undefined && (
            <span className="card-stat" title="Stars">
              <StarIcon />
              {formatNumber(stars)}
            </span>
          )}
        </div>
      </div>
      
      <p className="card-description">{description}</p>
      
      {tags && tags.length > 0 && (
        <div className="card-tags">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className={`tag ${getTagClass(tag)}`}>{tag}</span>
          ))}
          {tags.length > 3 && (
            <span className="card-tags-more">+{tags.length - 3}</span>
          )}
        </div>
      )}
      
      {actions && <div className="card-actions">{actions}</div>}
    </div>
  );
});

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

function getTagClass(tag: string): string {
  const tagLower = tag.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const tagClasses: Record<string, string> = {
    'development': 'tag-development',
    'frontend': 'tag-frontend',
    'design': 'tag-design',
    'workflow': 'tag-workflow',
    'productivity': 'tag-productivity',
    'code-review': 'tag-code-review',
    'codereview': 'tag-code-review',
    'ai': 'tag-ai',
    'ai-powered': 'tag-ai-powered',
    'security': 'tag-security',
    'testing': 'tag-testing',
    'test': 'tag-test',
    'database': 'tag-database',
    'db': 'tag-db',
    'api': 'tag-api',
    'xlsx': 'tag-xlsx',
    'excel': 'tag-excel',
    'docx': 'tag-docx',
    'word': 'tag-word',
    'pptx': 'tag-pptx',
    'powerpoint': 'tag-powerpoint',
    'pdf': 'tag-pdf',
    'typescript': 'tag-typescript',
    'ts': 'tag-ts',
    'javascript': 'tag-javascript',
    'js': 'tag-js',
    'python': 'tag-python',
    'nodejs': 'tag-nodejs',
    'node': 'tag-node',
    'react': 'tag-react',
    'async': 'tag-async',
    'workflow-automation': 'tag-workflow-automation',
  };
  return tagClasses[tagLower] || '';
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2v6M3.5 5.5L6 8l2.5-2.5M2 10h8" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1l1.5 3.1 3.4.5-2.5 2.4.6 3.4L6 8.8l-3 1.6.6-3.4-2.5-2.4 3.4-.5L6 1z" />
    </svg>
  );
}
