import laptop from '../../assets/images/Categories/Laptop.webp';
import mobiles1 from '../../assets/images/Categories/mobile1.png';
import fashion from '../../assets/images/Categories/fashion.webp';
import electronics from '../../assets/images/Categories/electronics.webp';
import home from '../../assets/images/Categories/home.webp';
import appliances from '../../assets/images/Categories/appliances.webp';
// import travel from '../../assets/images/Categories/travel.png';
// import furniture from '../../assets/images/Categories/furniture.png';
// import beauty from '../../assets/images/Categories/beauty.png';
// import grocery from '../../assets/images/Categories/grocery.png';
import { Link } from 'react-router-dom';

const catNav = [
    {
        name: "Electronics",
        icon: electronics,
    },
    {
        name: "Mobiles",
        icon: mobiles1,
    },
    {
        name: "Laptops",
        icon: laptop,
    },
    {
        name: "Fashion",
        icon: fashion,
    },
    {
        name: "Appliances",
        icon: appliances,
    },
    {
        name: "Home",
        icon: home,
    }
]

const Categories = () => {
    return (
        <section className="hidden sm:block bg-white mt-10 mb-4 min-w-full px-12 py-1 shadow overflow-hidden">

            <div className="flex items-center justify-between mt-4">

                {catNav.map((item, i) => (
                    <Link to={`/products?category=${item.name}`} className="flex flex-col gap-1 items-center p-2 group" key={i}>
                        <div className="h-16 w-16">
                            <img draggable="false" className="h-full w-full object-contain" src={item.icon} alt={item.name} />
                        </div>
                        <span className="text-sm text-gray-800 font-medium group-hover:text-primary-blue">{item.name}</span>
                    </Link>
                ))}

            </div>
        </section>
    );
};

export default Categories;
