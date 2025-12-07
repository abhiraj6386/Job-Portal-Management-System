import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  // State for filtering, searching, sorting, and pagination
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState(""); // newest, oldest, salaryHigh, salaryLow
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    try {
      // Build query string
      let query = `http://localhost:10000/api/v1/job/getall?page=${page}&limit=8`; // limit 8 per page
      if (debouncedKeyword) query += `&keyword=${debouncedKeyword}`;
      if (category) query += `&category=${category}`;
      if (sort) query += `&sort=${sort}`;

      axios
        .get(query, {
          withCredentials: true,
        })
        .then((res) => {
          setJobs(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  }, [debouncedKeyword, category, sort, page, isAuthorized]);

  if (!isAuthorized) {
    navigateTo("/");
  }

  const handleSearch = (e) => setKeyword(e.target.value);
  const handleCategory = (e) => setCategory(e.target.value);
  const handleSort = (e) => setSort(e.target.value);

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => prev + 1);

  return (
    <section className="jobs page">
      <div className="container">
        <h1>ALL AVAILABLE JOBS</h1>

        {/* Filter Bar */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search Job Title..."
            value={keyword}
            onChange={handleSearch}
          />
          <select value={category} onChange={handleCategory}>
            <option value="">Category (All)</option>
            <option value="Graphics & Design">Graphics & Design</option>
            <option value="Mobile App Development">Mobile App Development</option>
            <option value="Frontend Web Development">Frontend Web Development</option>
            <option value="MERN Stack Development">MERN Stack Development</option>
            <option value="Account & Finance">Account & Finance</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Video Animation">Video Animation</option>
            <option value="MEAN Stack Development">MEAN Stack Development</option>
            <option value="MEVN Stack Development">MEVN Stack Development</option>
            <option value="Data Entry Operator">Data Entry Operator</option>
          </select>
          <select value={sort} onChange={handleSort}>
            <option value="">Sort By (Default)</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="salaryHigh">Salary (High to Low)</option>
            <option value="salaryLow">Salary (Low to High)</option>
          </select>
        </div>

        <div className="banner">
          {jobs.jobs &&
            jobs.jobs.map((element) => {
              return (
                <div className="card" key={element._id}>
                  <p>{element.title}</p>
                  <p>{element.category}</p>
                  <p>{element.country}</p>
                  <Link to={`/job/${element._id}`}>Job Details</Link>
                </div>
              );
            })}
        </div>

        {/* Pagination Controls */}
        <div className="pagination">
          <button onClick={handlePrev} disabled={page === 1}>&lt; Previous</button>
          <span>Page {page}</span>
          <button onClick={handleNext} disabled={jobs.jobs && jobs.jobs.length < 8}>Next &gt;</button>
        </div>

      </div>
    </section>
  );
};

export default Jobs;
