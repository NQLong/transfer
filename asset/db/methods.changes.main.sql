CREATE OR REPLACE FUNCTION FW_SV_SDH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                      listFaculty IN STRING, listNganh IN STRING, listFromCity IN STRING,
                                      listEthnic IN STRING,
                                      listNationality IN STRING, listReligion IN STRING,
                                      listTinhTrangSinhVien IN STRING,
                                      gender IN STRING, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM FW_SINH_VIEN_SDH STU
             LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
             LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_TICH
             LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
             LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
             LEFT JOIN DM_NGANH_SAU_DAI_HOC KHOA ON KHOA.MA_KHOA = STU.MA_KHOA
             LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
    WHERE (
                  (listFaculty IS NOT NULL AND STU.MA_KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
                   listFaculty IS NULL)
                  AND
                  (listNganh IS NOT NULL AND STU.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null) OR
                   listNganh IS NULL)
                  AND (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0 OR listEthnic IS NULL)
                  AND
                  (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_TICH) != 0 OR
                   listNationality IS NULL)
                  AND (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0 OR listReligion IS NULL)
                  AND (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0 OR
                       listTinhTrangSinhVien IS NULL)
                  AND (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender OR gender IS NULL));

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN STUDENT_INFO FOR
        SELECT *
        FROM (SELECT STU.MA                   AS                       "mssv",
                     STU.HO                   AS                       "ho",
                     STU.TEN                  AS                       "ten",
                     STU.EMAIL                AS                       "emailCaNhan",
                     STU.NGAY_SINH            AS                       "ngaySinh",
                     STU.GIOI_TINH            AS                       "gioiTinh",
                     STU.DAN_TOC              AS                       "maDanToc",
                     STU.QUOC_TICH            AS                       "maQuocGia",
                     TTSV.TEN                 AS                       "tinhTrangSinhVien",
                     STU.MA_KHOA              AS                       "khoa",
                     KHOA.TEN                 AS                       "tenKhoa",
                     STU.MA_NGANH             AS                       "maNganh",
                     TONGIAO.TEN              AS                       "tonGiao",
                     QG.TEN_QUOC_GIA          AS                       "quocTich",
                     DANTOC.TEN               AS                       "danToc",
                     STU.NAM_TUYEN_SINH       AS                       "namTuyenSinh",
                     STU.CHUONG_TRINH_DAO_TAO AS                       "chuongTrinhDaoTao",
                     NSDH.TEN                 AS                       "tenNganh",
                     STU.CO_QUAN              AS                       "coQuan",
                     STU.SDT_CA_NHAN          AS                       "sdtCaNhan",
                     STU.SDT_LIEN_HE          AS                       "sdtLienHe",
                     TTP.TEN                  AS                       "noiSinh",
                     STU.HIEN_TAI_SO_NHA      AS                       "hienTaiSoNha",
                     STU.TEN_DE_TAI           AS                       "tenDeTai",
                     ROW_NUMBER() OVER (ORDER BY
                         STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.TEN ) R
              FROM FW_SINH_VIEN_SDH STU
                       LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
                       LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_TICH
                       LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                       LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                       LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
                       LEFT JOIN DM_KHOA_SAU_DAI_HOC KHOA ON KHOA.MA = STU.MA_KHOA
                       LEFT JOIN DM_NGANH_SAU_DAI_HOC NSDH ON STU.MA_NGANH = NSDH.MA_NGANH
                       LEFT JOIN DM_TINH_THANH_PHO TTP ON STU.NOI_SINH_MA_TINH = TTP.MA
              WHERE (
                      (listFaculty IS NOT NULL AND STU.MA_KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
                       listFaculty IS NULL)
                      AND
                      (listNganh IS NOT NULL AND STU.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null) OR
                       listNganh IS NULL)
                      AND (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0 OR listEthnic IS NULL)
                      AND
                      (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_TICH) != 0 OR
                       listNationality IS NULL)
                      AND (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0 OR listReligion IS NULL)
                      AND (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0 OR
                           listTinhTrangSinhVien IS NULL)
                      AND (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender OR gender IS NULL))
                AND (searchTerm = ''
                  OR LOWER(STU.MA) LIKE sT
                  OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
                  OR LOWER(STU.MA_NGANH) LIKE sT
                  OR LOWER(STU.SDT_CA_NHAN) LIKE sT
                  OR LOWER(STU.SDT_LIEN_HE) LIKE sT
                  OR LOWER(STU.EMAIL) LIKE sT)
              ORDER BY STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN STUDENT_INFO;
end;

/
--EndMethod--