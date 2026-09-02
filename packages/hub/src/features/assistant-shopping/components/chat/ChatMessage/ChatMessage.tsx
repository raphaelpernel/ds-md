import Image from 'next/image'
import type { ChatMessage as ChatMessageModel } from '@/features/assistant-shopping/data/types/chat'
import { RecipeCarousel } from '@/features/assistant-shopping/components/widgets/RecipeCarousel/RecipeCarousel'
import { ShoppingList } from '@/features/assistant-shopping/components/widgets/ShoppingList/ShoppingList'
import { ProductCarousel } from '@/features/assistant-shopping/components/widgets/ProductCarousel/ProductCarousel'
import { StoreLocatorWidget } from '@/features/assistant-shopping/components/widgets/StoreLocatorWidget/StoreLocatorWidget'
import { CartWidget } from '@/features/assistant-shopping/components/widgets/CartWidget/CartWidget'
import { AssistantIntro } from '../AssistantIntro/AssistantIntro'
import botAvatar from '@/features/assistant-shopping/assets/bot-avatar.png'
import './ChatMessage.css'

function ChatWidgetRenderer({ message }: { message: ChatMessageModel }) {
  if (!message.widget) return null

  switch (message.widget.type) {
    case 'recipe-carousel':
      return <RecipeCarousel recipeIds={message.widget.payload.recipeIds} />
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
  if (message.intro) {
    return <AssistantIntro text={message.text ?? ''} />
  }

  const isAssistant = message.role === 'assistant'

  return (
    <div className={`assistant-shopping-chat-message ${isAssistant ? 'assistant-shopping-chat-message--assistant' : 'assistant-shopping-chat-message--user'}`}>
      {isAssistant && (
        <span className="assistant-shopping-chat-message__avatar" aria-hidden="true">
          <Image src={botAvatar} alt="" width={32} height={32} />
        </span>
      )}

      <div className="assistant-shopping-chat-message__content">
        {message.text && <p className="assistant-shopping-chat-message__bubble">{message.text}</p>}
        <ChatWidgetRenderer message={message} />
      </div>
    </div>
  )
}

export default ChatMessage
