import HeroSection from '@/components/home/HeroSection'
import SpecialOffers from '@/components/home/SpecialOffers'
import Categories from '@/components/home/Categories'
import PopularDishes from '@/components/home/PopularDishes'
import AboutSection from '@/components/home/AboutSection'
import ContactSection from '@/components/contact/ContactSection'
import { useEffect } from 'react'

const Home = () => {
    useEffect(() => {
        document.title = 'ViệtFood - Món Ăn Việt Nam Trực Tuyến'
    }, [])

    return (
        <>
            <HeroSection />
            <SpecialOffers />
            <Categories />
            <PopularDishes />
            <AboutSection />
            <ContactSection />
        </>
    )
}

export default Home
