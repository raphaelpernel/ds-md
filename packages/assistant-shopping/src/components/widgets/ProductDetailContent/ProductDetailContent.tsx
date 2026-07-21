import type { Product } from '@/data/types/product'
import { formatPrice } from '@/lib/format'
import { getPricePerKg } from '@/lib/pricing'
import { getProductOrigin, getProductPackaging, getProductStorage, getProductSupplierAddress } from '@/lib/productDetails'
import './ProductDetailContent.css'

/** Fiche produit partagée par les vues plein cadre "swap" et "choix produit" —
 *  media, titre + prix + prix au kilo, sections Description / Informations
 *  pratiques / Marque. Chaque vue ajoute son propre slider d'action en dessous
 *  (remplacement exclusif vs ajout multiple), seul ce contenu est commun. */
export function ProductDetailContent({ product }: { product: Product }) {
  const pricePerKg = getPricePerKg(product)

  return (
    <>
      <div className="product-detail-content__hero">
        <span aria-hidden="true">{product.emoji}</span>
      </div>

      <div className="product-detail-content__body">
        <div className="product-detail-content__title">
          <h3>{product.name}</h3>
          <div className="product-detail-content__price">
            <span>{formatPrice(product.price)}</span>
            {pricePerKg && <span className="product-detail-content__price-unit">{pricePerKg}</span>}
          </div>
        </div>

        <section className="product-detail-content__section">
          <h4>Description</h4>
          <div className="product-detail-content__field">
            <p className="product-detail-content__field-label">Pays d’origine</p>
            <p>{getProductOrigin(product)}</p>
          </div>
        </section>

        <section className="product-detail-content__section">
          <h4>Informations pratiques</h4>
          <div className="product-detail-content__field">
            <p className="product-detail-content__field-label">Conservation</p>
            <p>{getProductStorage(product)}</p>
          </div>
          <div className="product-detail-content__field">
            <p className="product-detail-content__field-label">Emballage</p>
            <p>{getProductPackaging(product)}</p>
          </div>
        </section>

        <section className="product-detail-content__section">
          <h4>Marque</h4>
          <div className="product-detail-content__field">
            <p className="product-detail-content__field-label">{product.brand}</p>
            <p>{getProductSupplierAddress(product)}</p>
          </div>
        </section>
      </div>
    </>
  )
}

export default ProductDetailContent
