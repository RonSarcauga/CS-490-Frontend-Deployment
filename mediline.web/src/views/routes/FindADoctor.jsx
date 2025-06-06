import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState, useContext } from 'react';
import Container, { ItemGroup, PictureFrame } from '../../components/General/Container';
import BaseIcon from '../../components/General/BaseIcon';
import InputBar from '../../components/General/InputBar';
import Button from '../../components/General/Button';
import SelectList from '../../components/General/SelectList';
import Checkbox from '../../components/General/Checkbox';
import FindDoctorViewModel from '../../viewModels/FindDoctorViewModel';
import Spinner from '../../components/General/Spinner';
import Topbar, { TopbarItem } from '../../components/Dashboard/Topbar';
import { UserContext } from '../../context/UserProvider';

function isLoggedIn() {
  const token = localStorage.getItem('jwtToken');
  if (!token) return false;

  try {
    console.log()
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload));
    console.log(payload," ",exp)
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

export default function FindADoctorPage() {
    const { currentUser } = useContext(UserContext);
    // Used to manage the form data
    const [formData, setFormData] = useState(FindDoctorViewModel);
    const [page, setPage] = useState(1)
    // Used for fetching and loading the data
    const [data, setData] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true); // first load only
    const [searchLoading, setSearchLoading] = useState(false);  // search/filtering 

    // References for the select lists which can be used to invoke internal methods
    const specialtyDropdownRef = useRef();
    const ratingDropdownRef = useRef();

    // Used to extract parameters passed to the URL
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("query");

    // Used for navigating to other pages
    const navigate = useNavigate();

    // The click event for the reset filters button
    const clearFilters = () => {
        FindDoctorViewModel.clearFilters();
        //console.log("servicesRef:", specialtyDropdownRef.current);

        // Checks that the select lists are not null before invoking the reset method
        if (specialtyDropdownRef.current) {
            specialtyDropdownRef.current.reset();
        }
        if (ratingDropdownRef.current) {
            ratingDropdownRef.current.reset();
        }

        // Updates the form data that is displayed on the page
        setFormData({ ...FindDoctorViewModel });
    };

    useEffect(() => {// Reset filters when leaving the page
        // Check if a parameter has been passed from the Home Page
        if (!FindDoctorViewModel.filterByURL && searchQuery) {
            // Apply any queries from the Home Page
            FindDoctorViewModel.updateSearch(searchQuery);
            FindDoctorViewModel.filterByURL = true;
            FindDoctorViewModel.applyFilters();
            //console.log("Applied filters: ", FindDoctorViewModel.filters);

            // Updates the form data that is displayed on the page
            setFormData({ ...FindDoctorViewModel });
        }

        return () => {
            clearFilters();
            FindDoctorViewModel.filterByURL = false;
            //console.log("Did the filters get reset?\n", FindDoctorViewModel.filters);
        }
    }, [searchQuery]);

    const [specialtiesList, setSpecialties] = useState([]);

    useEffect(() => {
        if (data?.doctors && specialtiesList.length === 0) {
            const specials = FindDoctorViewModel.getSpecialties(data.doctors);
            setSpecialties(specials);
        }
    }, [data?.doctors]);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        setInitialLoading(true);
        const result = await FindDoctorViewModel.fetchDashboardData();
        setData(result);
        setInitialLoading(false);
    };

    /*if (!data || !data.specialties) return (
        <Container
            customClass="align-items-center justify-content-center"
            fitParent={true}
            content={[
                <>
                    <p>Error loading data</p>
                </>
            ]}
        />
    );*/

    return (
        <>
            <Container
                customClass="position-absolute bg-primary-400"
                style={{
                    top: "0",
                    left: "0",
                    minWidth: "100vw",
                    minHeight: "40vh",
                    zIndex: "-1"
                }}
            />
            <Container
                fitScreen={true}
                customClass="overflow-x-hidden overflow-hidden"
                headerClass="outline-neutral-1100 py-6"
                contentClass="align-items-center justify-content-center"
                header={[
                    <Topbar
                        customClass="px-10 pt-5"
                        itemClass="hover-group-primary-400 overflow-visible"
                        header={[
                            <ItemGroup
                                customClass="col-gap-4"
                                axis={false}
                                items={[
                                    <>
                                        <BaseIcon
                                            height={50}
                                            width={50}
                                            fillColor="none">
                                            <>
                                                <g id="SVGRepo_bgCarrier" stroke-width="0" />
                                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                                                <g id="SVGRepo_iconCarrier">
                                                    <path d="M12.2407 2.96432C12.0063 2.96432 11.797 3.07184 11.6595 3.24024L11.6024 3.28346C9.45801 2.63339 7.03194 3.15091 5.33598 4.83602C3.82743 6.33492 3.24863 8.40778 3.59957 10.3471L3.58455 10.3619L2.6274 11.3129C1.7951 12.1399 1.7951 13.4807 2.6274 14.3077C3.11636 14.7935 3.78381 14.9939 4.42002 14.9089C4.51377 15.2552 4.6974 15.5824 4.9709 15.8542C5.34265 16.2235 5.81755 16.4279 6.30347 16.4673C6.34307 16.9503 6.54878 17.4223 6.92061 17.7917C7.30952 18.1781 7.81134 18.384 8.32054 18.4093C8.34607 18.9151 8.55325 19.4136 8.94208 19.7999C9.70236 20.5554 10.8942 20.6207 11.7291 19.996L12.1156 20.3801C12.952 21.2111 14.3079 21.2111 15.1443 20.3801C15.5147 20.012 15.721 19.5428 15.7633 19.0621C16.2462 19.021 16.7177 18.8168 17.0874 18.4495C17.4581 18.0812 17.6636 17.6114 17.7043 17.1303C18.1809 17.0858 18.6453 16.8821 19.0104 16.5193C19.2966 16.235 19.4844 15.89 19.5738 15.526C20.2005 15.6003 20.854 15.3986 21.3349 14.9208C22.1672 14.0938 22.1672 12.753 21.3349 11.926L20.5014 11.0979L20.6727 10.4313C21.045 8.98208 20.8578 7.44693 20.1482 6.12848C19.1007 4.182 17.0615 2.96933 14.8448 2.96933L13.2381 2.96933C13.1696 2.96601 13.1008 2.96432 13.0316 2.96432H12.2407ZM15.1649 7.90945L18.6286 11.351L18.6325 11.3551L18.6458 11.3687L20.2708 12.9833C20.5155 13.2264 20.5155 13.6205 20.2708 13.8635C20.0262 14.1066 19.6296 14.1066 19.3849 13.8635L17.7599 12.2489C17.4661 11.9569 16.9897 11.9569 16.6959 12.2489L16.6796 12.2651C16.3857 12.557 16.3857 13.0304 16.6796 13.3223L17.9464 14.581C18.1912 14.8243 18.1912 15.2188 17.9464 15.4621C17.7232 15.6838 17.3724 15.7037 17.1274 15.5206C16.8267 15.2958 16.4051 15.3263 16.1403 15.592C15.8756 15.8577 15.8491 16.2769 16.0784 16.5734C16.2668 16.8171 16.2481 17.1689 16.0234 17.3922C15.7968 17.6173 15.4389 17.6344 15.1934 17.4424C14.8947 17.2087 14.4674 17.2332 14.1977 17.4995C13.9279 17.7658 13.9006 18.1902 14.1339 18.4885C14.3276 18.7361 14.3093 19.0952 14.0802 19.3228C13.8315 19.5699 13.4284 19.5699 13.1797 19.3228L12.808 18.9535L12.9132 18.8489C13.7455 18.0219 13.7455 16.6811 12.9132 15.8542C12.5243 15.4677 12.0225 15.2619 11.5133 15.2366C11.4878 14.7308 11.2806 14.2323 10.8918 13.8459C10.52 13.4766 10.0451 13.2722 9.55922 13.2328C9.51962 12.7499 9.3139 12.2779 8.94208 11.9084C8.45311 11.4226 7.78567 11.2222 7.14945 11.3072C7.0557 10.9609 6.87208 10.6337 6.59857 10.3619C6.16723 9.93332 5.597 9.72685 5.03184 9.7425C4.88504 8.36976 5.34111 6.94543 6.40004 5.89327C7.38426 4.91535 8.69207 4.45489 9.98101 4.5119L8.48356 5.64643C7.45969 6.42216 7.26245 7.87941 8.04327 8.89941C8.82232 9.91708 10.2805 10.1144 11.302 9.34048L13.1908 7.90945H15.1649ZM9.3894 6.84203L12.5277 4.46432H13.0316C13.0811 4.46432 13.1302 4.46565 13.1789 4.46826C13.1922 4.46898 13.2056 4.46933 13.219 4.46933H14.8448C16.513 4.46933 18.043 5.38193 18.8274 6.83933C19.3221 7.7586 19.4773 8.8178 19.2712 9.83451L16.0591 6.63806C15.9178 6.49195 15.7232 6.40945 15.52 6.40945L12.9388 6.40945C12.7752 6.40945 12.6162 6.4629 12.4858 6.56165L10.3962 8.14487C10.0326 8.42032 9.5116 8.3498 9.23434 7.98762C8.95886 7.62776 9.02817 7.11571 9.3894 6.84203ZM6.03496 14.7969C5.86706 14.6301 5.81439 14.3921 5.87697 14.1807C5.90557 14.084 5.95823 13.9929 6.03496 13.9167L6.99212 12.9657C7.23675 12.7226 7.63338 12.7226 7.87802 12.9657C8.11986 13.2059 8.12262 13.5938 7.8863 13.8375L7.87776 13.8459L6.92061 14.797L6.91236 14.8052C6.8374 14.877 6.74888 14.9265 6.65519 14.9539C6.44237 15.0161 6.20287 14.9637 6.03496 14.7969ZM5.54368 11.4285C5.61917 11.5066 5.67014 11.5995 5.69659 11.6976C5.75261 11.9054 5.6986 12.1364 5.53451 12.2994L4.57736 13.2504C4.33272 13.4935 3.93609 13.4935 3.69146 13.2504C3.44682 13.0073 3.44682 12.6133 3.69146 12.3702L4.64861 11.4192C4.89325 11.1761 5.28988 11.1761 5.53451 11.4192L5.54368 11.4285ZM10.892 18.7427C10.8152 18.8191 10.7233 18.8714 10.6258 18.8998C10.4132 18.9618 10.1739 18.9094 10.0061 18.7427C9.83837 18.576 9.78565 18.3383 9.84799 18.1269C9.87655 18.0301 9.92926 17.9388 10.0061 17.8625L10.9633 16.9114C11.2079 16.6683 11.6046 16.6683 11.8492 16.9114C12.0938 17.1545 12.0938 17.5486 11.8492 17.7917L10.892 18.7427ZM8.87057 16.7345C8.7939 16.8106 8.7023 16.8629 8.60513 16.8914C8.39225 16.9537 8.15263 16.9013 7.98467 16.7345C7.8167 16.5676 7.76406 16.3295 7.82675 16.118C7.85432 16.0249 7.9042 15.937 7.97639 15.8626L7.98492 15.8542L8.94208 14.9031L8.95032 14.8949C9.19556 14.6602 9.5859 14.6629 9.82772 14.9032C10.0724 15.1463 10.0724 15.5404 9.82772 15.7834L8.87057 16.7345Z" fill="#FFFFFF" />
                                                </g>
                                            </>
                                        </BaseIcon>
                                        <div className="font-7 text-neutral-1100">
                                            <h1 className="font-medium">MEDILINE</h1>
                                        </div>
                                    </>
                                ]}
                            />
                        ]}
                        items={[
                            <>
                                <TopbarItem
                                    to="/"
                                    textClass="text-neutral-1100"
                                    text={"Frontpage"}>
                                </TopbarItem>
                                <TopbarItem
                                    to={"/findADoctor"}
                                    textClass="text-neutral-1100"
                                    text={"Doctors"}>
                                </TopbarItem>
                                <TopbarItem
                                    to={"/discussionForumPage"}
                                    textClass="text-neutral-1100"
                                    text={"Discussion"}>
                                </TopbarItem>
                                {(currentUser && isLoggedIn()) ? (
                                    <TopbarItem
                                    to={
                                        currentUser?.role === "pharmacy"
                                            ? "/dashboard/pharmacist"
                                            : `/dashboard/${currentUser.role}`
                                    }
                                    text={"HOME"}
                                    customClass="button b-2 hover-box-shadow-sm shadow-neutral-1100"
                                    textClass="text-neutral-1100">
                                </TopbarItem>
                                ) : (
                                <TopbarItem
                                    to={"/login"}
                                    text={"SIGN IN"}
                                    customClass="button b-2 hover-box-shadow-sm shadow-neutral-1100"
                                    textClass="text-neutral-1100">
                                </TopbarItem>
                                )}
                            </>
                        ]}
                    />
                ]}
                content={[
                    <>
                        <ItemGroup
                            fitParent={true}
                            items={[
                                <>
                                    <div></div>
                                    <ItemGroup
                                        customClass="px-15"
                                        fitParent={true}
                                        items={[
                                            <>
                                                <div></div>
                                                <ItemGroup
                                                    axis={true}
                                                    customClass="bg-neutral-1100 b-bottom-2 br-top-lg p-10 outline-neutral-700 box-shadow-sm"
                                                    fitParent={true}
                                                    items={[
                                                        <>
                                                            <ItemGroup
                                                                customClass="align-items-center justify-content-center px-10"
                                                                fitParent={true}
                                                                axis={false}
                                                                stretch={true}
                                                                items={[
                                                                    <>
                                                                        <h1 className="font-10 font-semibold">Find a Doctor</h1>
                                                                        
                                                                    </>
                                                                ]}
                                                            />
                                                        </>
                                                    ]}
                                                />
                                                <ItemGroup
                                                    customClass={`gap-5 bg-neutral-1100 pt-5 box-shadow-sm pb-5 br-bottom-lg ${initialLoading? "justify-content-center" : "justify-content-space-between"}`}
                                                    fitParent={true}
                                                    axis={false}
                                                    stretch={true}
                                                    items={[
                                                        <>  {initialLoading ? (
                                                                <Container customClass="p-5" content={[<Spinner size={64} />]} />
                                                            ) : (
                                                            <>
                                                            <div/>
                                                            <ItemGroup
                                                                customClass="bg-neutral-1100 br-md p-10 gap-7 box-shadow-sm align-content-center"
                                                                style={{
                                                                    minHeight: "62vh",
                                                                    maxHeight: "62vh"
                                                                }}
                                                                axis={true}
                                                                items={[
                                                                    <>
                                                                        <ItemGroup
                                                                            customClass='gap-2'
                                                                            axis={true}
                                                                            items={[
                                                                                <>
                                                                                    <h1 className="font-10">Search by</h1>
                                                                                    <p className="font-5 mb-3">Specialty, Expertise, or Name</p>
                                                                                    <InputBar
                                                                                        customClass='b-2 outline-neutral-800 bg-0 py-4 pr-1 br-lg'
                                                                                        onChange={(e) => {
                                                                                            FindDoctorViewModel.updateSearch(e.target.value);
                                                                                            setFormData({ ...FindDoctorViewModel });
                                                                                        }}
                                                                                        value={formData.activeFilters.search}
                                                                                        /*sendIcon={
                                                                                            <span className="button bg-primary-500 br-full circle p-0">
                                                                                                <BaseIcon height={24} width={24} viewBox="0 -960 960 960" fillColor="#FFFFFF">
                                                                                                    <path d="M765-144 526-383q-30 22-65.79 34.5-35.79 12.5-76.18 12.5Q284-336 214-406t-70-170q0-100 70-170t170-70q100 0 170 70t70 170.03q0 40.39-12.5 76.18Q599-464 577-434l239 239-51 51ZM384-408q70 0 119-49t49-119q0-70-49-119t-119-49q-70 0-119 49t-49 119q0 70 49 119t119 49Z" />
                                                                                                </BaseIcon>
                                                                                            </span>
                                                                                        }*/
                                                                                        placeholder="e.g. Exercise"
                                                                                    />
                                                                                </>
                                                                            ]}
                                                                        />
                                                                        <Checkbox
                                                                            checked={formData.filters.acceptingNewPatients}
                                                                            onChange={(checked) => {
                                                                                FindDoctorViewModel.updateFilter("acceptingNewPatients", checked);
                                                                                setFormData({ ...FindDoctorViewModel });
                                                                            }}
                                                                            label={[
                                                                                <p>Accepting New Patients</p>
                                                                            ]}
                                                                        />
                                                                        <ItemGroup
                                                                            customClass='gap-5'
                                                                            fitParent={true}
                                                                            axis={true}
                                                                            items={[
                                                                                <>
                                                                                    <ItemGroup
                                                                                        customClass="align-items-center gap-3"
                                                                                        stretch={true}
                                                                                        axis={false}
                                                                                        items={[
                                                                                            <>
                                                                                                <BaseIcon
                                                                                                    fill="none"
                                                                                                    height="40px"
                                                                                                    width="40px">
                                                                                                    <g id="SVGRepo_bgCarrier" stroke-width="0" />
                                                                                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                    <g id="SVGRepo_iconCarrier">
                                                                                                        <title>Filter</title>
                                                                                                        <g id="Page-1" stroke-width="0.9600000000000002" fill="none" fill-rule="evenodd">
                                                                                                            <g id="Filter">
                                                                                                                <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24">
                                                                                                                </rect>
                                                                                                                <line x1="4" y1="5" x2="16" y2="5" id="Path" stroke="#0C0310" stroke-width="1.5" stroke-linecap="round">
                                                                                                                </line>
                                                                                                                <line x1="4" y1="12" x2="10" y2="12" id="Path" stroke="#0C0310" stroke-width="1.5" stroke-linecap="round">
                                                                                                                </line> <line x1="14" y1="12" x2="20" y2="12" id="Path" stroke="#0C0310" stroke-width="1.5" stroke-linecap="round">
                                                                                                                </line> <line x1="8" y1="19" x2="20" y2="19" id="Path" stroke="#0C0310" stroke-width="1.5" stroke-linecap="round">
                                                                                                                </line>
                                                                                                                <circle id="Oval" stroke="#0C0310" stroke-width="1.5" stroke-linecap="round" cx="18" cy="5" r="2">
                                                                                                                </circle>
                                                                                                                <circle id="Oval" stroke="#0C0310" stroke-width="1.5" stroke-linecap="round" cx="12" cy="12" r="2">
                                                                                                                </circle>
                                                                                                                <circle id="Oval" stroke="#0C0310" stroke-width="1.5" stroke-linecap="round" cx="6" cy="19" r="2">
                                                                                                                </circle>
                                                                                                            </g>
                                                                                                        </g>
                                                                                                    </g>
                                                                                                </BaseIcon>
                                                                                                <h1 className="font-10">Filter</h1>
                                                                                            </>
                                                                                        ]}
                                                                                    />
                                                                                    <ItemGroup
                                                                                        customClass="gap-3"
                                                                                        axis={true}
                                                                                        fitParent={true}
                                                                                        items={[
                                                                                            <>
                                                                                                <SelectList
                                                                                                    ref={specialtyDropdownRef}
                                                                                                    items={specialtiesList}
                                                                                                    onSelect={(item) => {
                                                                                                        FindDoctorViewModel.updateFilter("specialty", item.label);
                                                                                                        setFormData({ ...FindDoctorViewModel });
                                                                                                    }}
                                                                                                    placeholder="Specialty"
                                                                                                />
                                                                                                <SelectList
                                                                                                    ref={ratingDropdownRef}
                                                                                                    items={formData.getRatings()}
                                                                                                    onSelect={(item) => {
                                                                                                        FindDoctorViewModel.updateFilter("rating", item.value);
                                                                                                        setFormData({ ...FindDoctorViewModel });
                                                                                                    }}
                                                                                                    placeholder="Rating"
                                                                                                />
                                                                                                <Button
                                                                                                    customClass="br-lg bg-primary-500 hover-box-shadow-sm shadow-primary-400"
                                                                                                    isClickable={true}
                                                                                                    onClick={async (e) => {
                                                                                                        e.preventDefault();

                                                                                                        // Set loading state to true
                                                                                                        setSearchLoading(true);

                                                                                                        try {
                                                                                                            // Apply filters and fetch the filtered list of doctors
                                                                                                            const filteredDoctors = await FindDoctorViewModel.applyFilters();

                                                                                                            // Update the state with the filtered doctors
                                                                                                            setData((prevData) => ({
                                                                                                                ...prevData,
                                                                                                                doctors: filteredDoctors,
                                                                                                            }));

                                                                                                            //console.log("Filters applied: ", FindDoctorViewModel.filters);
                                                                                                        } catch (error) {
                                                                                                            console.error("Error applying filters: ", error);
                                                                                                        } finally {
                                                                                                            // Set loading state to false and close the modal
                                                                                                            setSearchLoading(false);
                                                                                                        }
                                                                                                    }}
                                                                                                    style={{
                                                                                                        width: "100%"
                                                                                                    }}
                                                                                                    content={[
                                                                                                        <p className="font-semibold py-1">Update Results</p>
                                                                                                    ]}
                                                                                                />
                                                                                            </>
                                                                                        ]}
                                                                                    />
                                                                                </>
                                                                            ]}
                                                                        />
                                                                    </>
                                                                ]}
                                                            />
                                                            <ItemGroup
                                                                customClass="bg-neutral-1100 br-md p-10 gap-8 box-shadow-sm"
                                                                style={{
                                                                    width: "70vw"
                                                                }}
                                                                stretch={true}
                                                                axis={true}
                                                                items={[
                                                                    <>
                                                                        <ItemGroup
                                                                            customClass="justify-content-space-between"
                                                                            fitParent={true}
                                                                            axis={false}
                                                                            stretch={true}
                                                                            items={[
                                                                                <>
                                                                                    <h1 className="font-10">Search Results</h1>
                                                                                    <ItemGroup
                                                                                        customClass="gap-2"
                                                                                        fitParent={true}
                                                                                        axis={false}
                                                                                        items={[
                                                                                            <>
                                                                                                <ItemGroup
                                                                                                    customClass="b-3 outline-neutral-1000 br-sm align-items-center justify-items-center px-3 gap-3"
                                                                                                    isClickable={true}
                                                                                                    onClick={async (e) => {
                                                                                                        e.preventDefault();

                                                                                                        // Set loading state to true
                                                                                                        setSearchLoading(true);

                                                                                                        try {
                                                                                                            // Apply filters and fetch the filtered list of doctors
                                                                                                            const unfilteredDoctors = await FindDoctorViewModel.clearFilters();

                                                                                                            // Update the state with the filtered doctors
                                                                                                            setData((prevData) => ({
                                                                                                                ...prevData,
                                                                                                                doctors: unfilteredDoctors,
                                                                                                            }));

                                                                                                            //console.log("Filters applied: ", FindDoctorViewModel.filters);
                                                                                                        } catch (error) {
                                                                                                            console.error("Error applying filters: ", error);
                                                                                                        } finally {
                                                                                                            // Set loading state to false and close the modal
                                                                                                            setSearchLoading(false);
                                                                                                        }
                                                                                                    }}
                                                                                                    stretch={true}
                                                                                                    axis={false}
                                                                                                    items={[
                                                                                                        <>
                                                                                                            <BaseIcon
                                                                                                                fill="#000000"
                                                                                                                height="20px"
                                                                                                                width="20px"
                                                                                                                viewBox="0 0 1920 1920">
                                                                                                                <g id="SVGRepo_bgCarrier" stroke-width="0" />
                                                                                                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                                <g id="SVGRepo_iconCarrier">
                                                                                                                    <path d="M960 0v112.941c467.125 0 847.059 379.934 847.059 847.059 0 467.125-379.934 847.059-847.059 847.059-467.125 0-847.059-379.934-847.059-847.059 0-267.106 126.607-515.915 338.824-675.727v393.374h112.94V112.941H0v112.941h342.89C127.058 407.38 0 674.711 0 960c0 529.355 430.645 960 960 960s960-430.645 960-960S1489.355 0 960 0" fill-rule="evenodd" />
                                                                                                                </g>
                                                                                                            </BaseIcon>
                                                                                                            <h1 className="font-5">
                                                                                                                Reset Filter
                                                                                                            </h1>
                                                                                                        </>
                                                                                                    ]}
                                                                                                />
                                                                                                <ItemGroup
                                                                                                    customClass="button bg-primary-500 br-sm align-items-center justify-items-center px-4 py-3 gap-3"
                                                                                                    isClickable={FindDoctorViewModel.doctorId !== null}
                                                                                                    dataAttributes={
                                                                                                        { disabled: FindDoctorViewModel.doctorId === null }
                                                                                                    }
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
                                                                                                        navigate('/login');
                                                                                                    }}
                                                                                                    stretch={true}
                                                                                                    axis={false}
                                                                                                    items={[
                                                                                                        <>
                                                                                                            <h1 className="font-5 font-medium text-neutral-1100">
                                                                                                                Add Doctor
                                                                                                            </h1>
                                                                                                        </>
                                                                                                    ]}
                                                                                                />
                                                                                            </>
                                                                                        ]}
                                                                                    />
                                                                                </>
                                                                            ]}
                                                                        />
                                                                        {searchLoading ? (
                                                                            <Container customClass="p-5 align-self-center" content={[<Spinner size={64} />]} />
                                                                        ) : (
                                                                        <ItemGroup
                                                                            customClass="gap-5 scrollable p-5"
                                                                            axis={true}
                                                                            fitParent={true}
                                                                            style={{
                                                                                minHeight: "45vh",
                                                                                maxHeight: "45vh"
                                                                            }}
                                                                            items={data.doctors.map((doctor) => (
                                                                                <Container
                                                                                    key={doctor.user_id}
                                                                                    customClass={`p-10 box-shadow-sm outline-neutral-900 hover-b-4 hover-outline-secondary-400 br-md ${FindDoctorViewModel.doctorId === doctor.user_id ? 'selected' : ''}`}
                                                                                    isClickable={true}
                                                                                    onClick={() => {
                                                                                        if (FindDoctorViewModel.doctorId !== null && FindDoctorViewModel.doctorId === doctor.user_id) {
                                                                                            FindDoctorViewModel.doctorId = null;
                                                                                        }
                                                                                        else {
                                                                                            FindDoctorViewModel.doctorId = doctor.user_id;
                                                                                        }
                                                                                        setFormData({ ...FindDoctorViewModel });
                                                                                        //console.log("You selected ", FindDoctorViewModel.doctorId);
                                                                                    }}
                                                                                    fitParent={true}
                                                                                    content={[
                                                                                        <>
                                                                                            <ItemGroup
                                                                                                customClass="justify-content-space-between"
                                                                                                fitParent={true}
                                                                                                stretch={true}
                                                                                                axis={false}
                                                                                                items={[
                                                                                                    <>
                                                                                                        <ItemGroup
                                                                                                            customClass="gap-10 align-items-center"
                                                                                                            stretch={true}
                                                                                                            axis={false}
                                                                                                            items={[
                                                                                                                <>
                                                                                                                    <BaseIcon
                                                                                                                        height={100}
                                                                                                                        width={100}
                                                                                                                        fillColor='none'
                                                                                                                        viewBox='0 0 61.7998 61.7998'>
                                                                                                                        <circle cx="30.8999" cy="30.8999" fill="hsl(210, 50%, 90%)" r="30.8999" />

                                                                                                                        <path d="M23.255 38.68l15.907.121v12.918l-15.907-.121V38.68z" fill="hsl(210, 10%, 95%)" fill-rule="evenodd" />

                                                                                                                        <path d="M43.971 58.905a30.967 30.967 0 0 1-25.843.14V48.417H43.97z" fill="hsl(210, 50%, 90%)" fill-rule="evenodd" />

                                                                                                                        <path d="M33.403 61.7q-1.238.099-2.503.1-.955 0-1.895-.057l1.03-8.988h2.41z" fill="hsl(210, 40%, 70%)" fill-rule="evenodd" />

                                                                                                                        <path d="M25.657 61.332A34.072 34.072 0 0 1 15.9 57.92a31.033 31.033 0 0 1-7.857-6.225l1.284-3.1 13.925-6.212c0 5.212 1.711 13.482 2.405 18.95z" fill="hsl(210, 40%, 95%)" fill-rule="evenodd" />

                                                                                                                        <path d="M39.165 38.759v3.231c-4.732 5.527-13.773 4.745-15.8-3.412z" fill-rule="evenodd" opacity="0.11" />

                                                                                                                        <path d="M31.129 8.432c21.281 0 12.987 35.266 0 35.266-12.267 0-21.281-35.266 0-35.266z" fill="hsl(210, 10%, 95%)" fill-rule="evenodd" />

                                                                                                                        <path d="M18.365 24.046c-3.07 1.339-.46 7.686 1.472 7.658a31.972 31.972 0 0 1-1.472-7.659z" fill="hsl(210, 10%, 95%)" fill-rule="evenodd" />

                                                                                                                        <path d="M44.14 24.045c3.07 1.339.46 7.687-1.471 7.658a31.993 31.993 0 0 0 1.471-7.658z" fill="hsl(210, 10%, 95%)" fill-rule="evenodd" />

                                                                                                                        <path d="M21.931 14.328c-3.334 3.458-2.161 13.03-2.161 13.03l-1.05-.495c-6.554-25.394 31.634-25.395 25.043 0l-1.05.495s1.174-9.572-2.16-13.03c-4.119 3.995-14.526 3.974-18.622 0z" fill="hsl(210, 30%, 70%)" fill-rule="evenodd" />

                                                                                                                        <path d="M36.767 61.243a30.863 30.863 0 0 0 17.408-10.018l-1.09-2.631-13.924-6.212c0 5.212-1.7 13.393-2.394 18.861z" fill="hsl(210, 40%, 95%)" fill-rule="evenodd" />

                                                                                                                        <path d="M39.162 41.98l-7.926 6.465 6.573 5.913s1.752-9.704 1.353-12.378z" fill="hsl(210, 50%, 90%)" fill-rule="evenodd" />

                                                                                                                        <path d="M23.253 41.98l7.989 6.465-6.645 5.913s-1.746-9.704-1.344-12.378z" fill="hsl(210, 50%, 90%)" fill-rule="evenodd" />

                                                                                                                        <path d="M28.109 51.227l3.137-2.818 3.137 2.818-3.137 2.817-3.137-2.817z" fill="hsl(210, 40%, 70%)" fill-rule="evenodd" />

                                                                                                                        <path d="M25.767 61.373a30.815 30.815 0 0 1-3.779-.88 2.652 2.652 0 0 1-.114-.093l-3.535-6.39 4.541-3.26h-4.752l1.017-6.851 4.11-2.599c.178 7.37 1.759 15.656 2.512 20.073z" fill="hsl(210, 40%, 93%)" fill-rule="evenodd" />

                                                                                                                        <path d="M36.645 61.266c.588-.098 1.17-.234 1.747-.384.682-.177 1.36-.377 2.034-.579l.134-.043 3.511-6.315-4.541-3.242h4.752l-1.017-6.817-4.11-2.586c-.178 7.332-1.758 15.571-2.51 19.966z" fill="hsl(210, 40%, 93%)" fill-rule="evenodd" />
                                                                                                                    </BaseIcon>
                                                                                                                    <ItemGroup
                                                                                                                        customClass="gap-3"
                                                                                                                        axis={true}
                                                                                                                        stretch={true}
                                                                                                                        items={[
                                                                                                                            <>
                                                                                                                                <ItemGroup
                                                                                                                                    customClass="gap-1 align-items-center"
                                                                                                                                    axis={true}
                                                                                                                                    stretch={true}
                                                                                                                                    items={[
                                                                                                                                        <>
                                                                                                                                            <h1 className="font-semibold font-5">{doctor.name}</h1>
                                                                                                                                            <h1 className="font-semibold font-4">{doctor.specialization}</h1>
                                                                                                                                        </>
                                                                                                                                    ]}
                                                                                                                                />
                                                                                                                                {doctor.user.accepting_patients ? (
                                                                                                                                    <ItemGroup
                                                                                                                                        customClass="gap-3 align-items-center"
                                                                                                                                        stretch={true}
                                                                                                                                        axis={false}
                                                                                                                                        items={[
                                                                                                                                            <>
                                                                                                                                                <BaseIcon
                                                                                                                                                    height={20}
                                                                                                                                                    width={20}
                                                                                                                                                    viewBox="0 0 24 24"
                                                                                                                                                    fillColor="none">
                                                                                                                                                    <g id="SVGRepo_bgCarrier" stroke-width="0" />
                                                                                                                                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                                                                    <g id="SVGRepo_iconCarrier"> <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="hsl(210, 70%, 50%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                                                                    </g>
                                                                                                                                                </BaseIcon>
                                                                                                                                                <p className="font-4 text-primary-500">New Patients</p>
                                                                                                                                            </>
                                                                                                                                        ]}
                                                                                                                                    />
                                                                                                                                ) : (
                                                                                                                                    <ItemGroup
                                                                                                                                        customClass="gap-3 align-items-center"
                                                                                                                                        stretch={true}
                                                                                                                                        axis={false}
                                                                                                                                        items={[
                                                                                                                                            <>
                                                                                                                                                <BaseIcon
                                                                                                                                                    height={20}
                                                                                                                                                    width={20}
                                                                                                                                                    viewBox="-3.5 0 19 19"
                                                                                                                                                    fillColor="hsl(0, 70%, 50%)">
                                                                                                                                                    <g id="SVGRepo_bgCarrier" stroke-width="0" />
                                                                                                                                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                                                                    <g id="SVGRepo_iconCarrier">
                                                                                                                                                        <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z" />
                                                                                                                                                    </g>
                                                                                                                                                </BaseIcon>
                                                                                                                                                <p className="font-4 text-warning-200">New Patients</p>
                                                                                                                                            </>
                                                                                                                                        ]}
                                                                                                                                    />
                                                                                                                                )}
                                                                                                                            </>
                                                                                                                        ]}
                                                                                                                    />
                                                                                                                </>
                                                                                                            ]}
                                                                                                        />
                                                                                                        <ItemGroup
                                                                                                            customClass="align-items-center gap-2 align-self-start"
                                                                                                            axis={false}
                                                                                                            items={[
                                                                                                                <>
                                                                                                                    <BaseIcon
                                                                                                                        height={28}
                                                                                                                        width={30}
                                                                                                                        fillColor="none">
                                                                                                                        <g id="SVGRepo_bgCarrier" stroke-width="0" />
                                                                                                                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                                        <g id="SVGRepo_iconCarrier">
                                                                                                                            <path d="M8 12L11.5409 4.91816C11.81 4.38002 12.4136 4.09731 12.9992 4.23512V4.23512C13.5856 4.37308 14 4.8963 14 5.49867V9.64706H17.5767C18.8334 9.64706 19.7787 10.7925 19.5404 12.0264L18.1565 19.1897C18.0657 19.6601 17.6538 20 17.1747 20H8V12Z" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                                            <path d="M4 13C4 12.4477 4.44772 12 5 12H8V20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                                                                        </g>
                                                                                                                    </BaseIcon>
                                                                                                                    <p className="font-semibold">{doctor.rating}%</p>
                                                                                                                </>
                                                                                                            ]}
                                                                                                        />
                                                                                                    </>
                                                                                                ]}
                                                                                            />
                                                                                        </>
                                                                                    ]}
                                                                                />
                                                                            ))}
                                                                        />
                                                                        )}
                                                                    </>
                                                                ]}
                                                            />
                                                            <div/>
                                                            </>
                                                            )/* end of condtional */} 
                                                        </>
                                                    ]}
                                                />
                                                                        
                                            </>
                                        ]}
                                    />
                                </>
                            ]}
                        />
                    </>
                ]}
            />
        </>
    );
}