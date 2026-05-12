import { redirect } from 'next/navigation';

// Home del influencer = catálogo. El dashboard quedó en /influencer/dashboard.
export default function InfluencerHome() {
  redirect('/influencer/catalog');
}
