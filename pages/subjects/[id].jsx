import { PencilIcon, TrashIcon } from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../../config';
import { useStore } from '../../store';

function Subject({ user, cookies }) {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const { subjects, setSubjects, deleteSubject } = useStore((state) => state);

  const subject = useStore(
    useCallback((state) => state.subjects.find((s) => s.id === id), [id])
  );

  const handleDeleteClick = async () => {
    setLoading(true);
    try {
      const { data: newSubject } = await axios.delete(
        `${API_URL}/subjects/${id}`,
        {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        }
      );

      deleteSubject(id);
      setLoading(false);
      router.push('/subjects');
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  // will fetch subjects if not already in store
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await axios.get(`${API_URL}/subjects`, {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`,
        },
      });
      setSubjects(data);
    };

    if (!subjects.length) {
      fetchSubjects();
    }
  }, [subjects]);

  return (
    <div className="container mx-auto">
      <div className="flex flex-row justify-between">
        <h1 className="my-5 text-3xl">{subject?.name}</h1>
        <div className="flex flex-row">
          {user.role.type !== 'student' ? (
            <Link href={`/subjects/edit/${subject?.id}`}>
              <a className="flex items-center justify-center h-10 px-4 mt-5 mr-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <PencilIcon className="w-4 h-4" />
              </a>
            </Link>
          ) : null}
          {user.role.type === 'administrator' ? (
            <button
              onClick={handleDeleteClick}
              className="flex items-center justify-center h-10 px-4 mt-5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
      <h2>Linked Articles</h2>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subject?.articles.map((article, idx) => (
                    <tr
                      key={article.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-200'}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        <Link href={`/articles/${article.id}`}>
                          <a>{article.name}</a>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Intl.DateTimeFormat('en-GB', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        }).format(new Date(article.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 my-4">
        <Link href="/subjects/">
          <a className="flex items-center justify-center w-full px-4 py-2 mx-auto text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Back
          </a>
        </Link>
      </div>

    </div>
    
  );
}

export const getServerSideProps = async (ctx) => {
  const cookies = nookies.get(ctx);

  let user = null;

  if (cookies?.jwt) {
    try {
      const { data } = await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`,
        },
      });
      user = data;
    } catch (e) {
      console.log(e);
    }
  }

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: {
      user,
      cookies,
    },
  };
};

export default Subject;
