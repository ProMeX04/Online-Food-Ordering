import HeroSection from '@/components/home/HeroSection'
import PopularDishes from '@/components/home/PopularDishes'
import AboutSection from '@/components/home/AboutSection'
import { useEffect } from 'react'

const Home = () => {
    useEffect(() => {
        document.title = 'ViệtFood - Món Ăn Việt Nam Trực Tuyến'
    }, [])

    return (
        <>
            <HeroSection />
            <PopularDishes />
            <AboutSection />
        </>
    )
}

export default Home
