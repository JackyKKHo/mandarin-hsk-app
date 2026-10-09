import AppHeader from '../components/AppHeader'
import { useSEO } from '../hooks/useSEO'

const UPDATED = '9 October 2026'

export default function PrivacyPage() {
  useSEO({ title: 'Privacy Policy', description: 'What Mandarin Daily stores, what it sends to other services, and how to delete your account.', path: '/privacy' })

  return (
    <div className="widget-page">
      <AppHeader />
      <main className="widget-main privacy-main">
        <h1 className="widget-title">Privacy policy</h1>
        <p className="widget-lede">Last updated {UPDATED}. This covers the Mandarin Daily website and the Android app, which is the same app.</p>

        <h2>Without an account</h2>
        <p>
          Your progress, review schedule, favourites, streak and settings are saved in your browser or app storage on
          your device. They are not sent to us. Clearing the app's storage removes them.
        </p>

        <h2>With an account</h2>
        <p>
          Signing in uses your email address and a one-time code. We store your email address and your study data
          (learned words, review cards, streak, custom decks, reminder settings) so it syncs between devices. This is
          held by Supabase, our database provider. Only you can read your rows.
        </p>

        <h2>Features that send data to other services</h2>
        <ul>
          <li><strong>Record &amp; Score:</strong> when you record yourself, the audio is sent to OpenAI to transcribe it and is then scored on our server. We don't keep the recording.</li>
          <li><strong>Lin Wei tutor and sentence feedback:</strong> the messages and sentences you write are sent to Anthropic (Claude) to generate a reply. We don't keep a copy.</li>
          <li><strong>Audio:</strong> Chinese text is sent to Google Text-to-Speech to make pronunciation audio. No personal data is included.</li>
          <li><strong>Emails:</strong> sign-in codes, optional daily reminders and feedback messages are sent through Resend.</li>
          <li><strong>Notifications:</strong> if you turn on reminders, we store a push subscription for your device so we can send them.</li>
        </ul>
        <p>
          The microphone is used only while you are recording. Our host, Vercel, keeps standard server logs (such as IP
          addresses) for a short time, and we use IP addresses to rate-limit the AI features.
        </p>

        <h2>What we don't do</h2>
        <p>No ads, no analytics or tracking SDKs, and we don't sell or share your data for marketing.</p>

        <h2 id="delete">Deleting your account</h2>
        <p>
          Use the Feedback button in the app and write “Delete my account” along with the email address you signed in
          with. We delete your account, email address and all synced study data within 30 days. Data saved only on your
          device is removed when you clear the app's storage or uninstall it.
        </p>

        <h2>Children</h2>
        <p>Mandarin Daily is not directed at children under 13.</p>

        <h2>Changes</h2>
        <p>If this policy changes, the date at the top will change too.</p>
      </main>
    </div>
  )
}
