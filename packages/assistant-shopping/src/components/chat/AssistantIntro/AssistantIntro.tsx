import Image from 'next/image'
import botFullbody from '@/assets/bot-fullbody.png'
import './AssistantIntro.css'

/** Message d'accueil affiché à l'ouverture du drawer — illustration pleine
 *  figure (`bot-fullbody`, jamais réutilisée ailleurs) + salutation, à la place
 *  de la bulle de chat standard. */
export function AssistantIntro({ text }: { text: string }) {
  return (
    <div className="assistant-intro">
      <Image src={botFullbody} alt="" width={120} height={196} className="assistant-intro__mascot" priority />
      <p className="assistant-intro__greeting">
        Bonjour, Raphaël <span aria-hidden="true">👋</span>
      </p>
      <p className="assistant-intro__text">{text}</p>
    </div>
  )
}

export default AssistantIntro
