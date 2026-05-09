import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../lib/imageUrl';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
}

function formatDimensions(w, h) {
  if (!w || !h) return null;
  return `${w}" × ${h}"`;
}

export default function ArtworkCard({ artwork }) {
  const { addItem } = useCart();
  const displayPrice = artwork.sale_price || artwork.price;
  const isOnSale = artwork.is_on_sale && artwork.sale_price;
  const isSold = !artwork.is_available;
  const dims = formatDimensions(artwork.width_inches, artwork.height_inches);

  return (
    <article className="artwork-card">
      <Link to={`/artwork/${artwork.slug || artwork.id}`}>
        <div className="artwork-card__image-wrapper">
          <img
            className="artwork-card__image"
            src={getImageUrl(artwork.image_url)}
            alt={artwork.title}
            loading="lazy"
          />
          <div className="artwork-card__overlay">
            {!isSold && (
              <button
                className="btn btn--ghost btn--sm artwork-card__quick-buy"
                onClick={(e) => { e.preventDefault(); addItem(artwork, 'original'); }}
              >
                <ShoppingBag size={14} />
                Add to Cart
              </button>
            )}
          </div>
          {isSold && <span className="artwork-card__badge artwork-card__badge--sold">Sold</span>}
          {isOnSale && !isSold && <span className="artwork-card__badge artwork-card__badge--sale">Sale</span>}
        </div>
      </Link>
      <div className="artwork-card__info">
        <Link to={`/artwork/${artwork.slug || artwork.id}`}>
          <h3 className="artwork-card__title">{artwork.title}</h3>
        </Link>
        <p className="artwork-card__meta">{artwork.medium}</p>
        {dims && <p className="artwork-card__dimensions">{dims}</p>}
        <div className="artwork-card__price">
          <span className="artwork-card__price-current">
            {isSold ? 'Sold' : formatPrice(displayPrice)}
          </span>
          {isOnSale && !isSold && (
            <span className="artwork-card__price-original">{formatPrice(artwork.price)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
