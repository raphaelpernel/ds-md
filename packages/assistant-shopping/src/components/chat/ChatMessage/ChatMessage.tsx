import { ChatCircleDots } from '@phosphor-icons/react'
import type { ChatMessage as ChatMessageModel } from '@/data/types/chat'
import { RecipeCarousel } from '@/components/widgets/RecipeCarousel/RecipeCarousel'
import { RecipeDetail } from '@/components/widgets/RecipeDetail/RecipeDetail'
import { ShoppingList } from '@/components/widgets/ShoppingList/ShoppingList'
import { ProductCarousel } from '@/components/widgets/ProductCarousel/ProductCarousel'
import { StoreLocatorWidget } from '@/components/widgets/StoreLocatorWidget/StoreLocatorWidget'
import { CartWidget } from '@/components/widgets/CartWidget/CartWidget'
import './ChatMessage.css'

function ChatWidgetRenderer({ message }: { message: ChatMessageModel }) {
  if (!message.widget) return null

  switch (message.widget.type) {
    case 'recipe-carousel':
      return <RecipeCarousel recipeIds={message.widget.payload.recipeIds} />
    case 'recipe-detail':
      return <RecipeDetail recipeId={message.widget.payload.recipeId} />
    case 'shopping-list':
      return <ShoppingList productIds={message.widget.payload.productIds} requestId={message.widget.payload.requestId} />
    case 'product-carousel':
      return <ProductCarousel productIds={message.widget.payload.productIds} />
    case 'store-locator':
      return <StoreLocatorWidget />
    case 'cart':
      return <CartWidget />
    default:
      return null
  }
}

export function ChatMessage({ message }: { message: ChatMessageModel }) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`chat-message ${isAssistant ? 'chat-message--assistant' : 'chat-message--user'}`}>
      {isAssistant && (
        <span className="chat-message__avatar" aria-hidden="true">
          <ChatCircleDots size={16} weight="fill" />
        </span>
      )}

      <div className="chat-message__content">
        {message.text && <p className="chat-message__bubble">{message.text}</p>}
        <ChatWidgetRenderer message={message} />
      </div>
    </div>
  )
}

export default ChatMessage
