CREATE OR REPLACE FUNCTION TCCB_CAN_BO_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    canbosys SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc STRING(100);
    listDonVi STRING(100);
    listNgach STRING(100);
    listHocVi STRING(100);
    listChucDanh STRING(100);
    gender STRING(3);
    isBienChe NUMBER;
    fromYear NUMBER;
    toYear NUMBER;
    listDanToc STRING(100);
    listTonGiao STRING(100);
    loaiHopDong NUMBER;
    loaiChuyenVien NUMBER;
    listQuocGia STRING(100);
    fromAge NUMBER;
    toAge NUMBER;
    listChuyenNganh STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNgach') INTO listNgach FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHocVi') INTO listHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucDanh') INTO listChucDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.isBienChe') INTO isBienChe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDanToc') INTO listDanToc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTonGiao') INTO listTonGiao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHopDong') INTO loaiHopDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiChuyenVien') INTO loaiChuyenVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listQuocGia') INTO listQuocGia FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromAge') INTO fromAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toAge') INTO toAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChuyenNganh') INTO listChuyenNganh FROM DUAL;

    OPEN canbosys FOR
        SELECT *
        FROM (
                 SELECT CB.SHCC                  AS "shcc",
                        CB.HO                    AS "ho",
                        CB.TEN                   AS "ten",
                        CB.PHAI                  AS "phai",
                        CB.MA_DON_VI             AS "maDonVi",
                        DV.TEN                   AS "tenDonVi",
                        NG.MA AS "ngach",
                        NG.TEN                   AS "tenChucDanhNgheNghiep",
                        TRINH_DO.TEN             AS "hocVi",
                        CB.NAM_HOC_VI AS "namHocVi",
                        CD.TEN                   AS "hocHam",
                        CB.NAM_CHUC_DANH AS "namChucDanh",
                        CB.CHUYEN_NGANH_CHUC_DANH AS "chuyenNganhChucDanh",
                        CB.NGAY_BAT_DAU_CONG_TAC AS "ngayBatDauCongTac",
                        CB.NGAY_BIEN_CHE         AS "ngayBienChe",
                        CB.THAC_SI               AS "thacSi",
                        CB.TIEN_SI               AS "tienSi",
                        CB.CHUYEN_NGANH          AS "chuyenNganh",
                        CB.QUE_QUAN AS "queQuan",
                        CB.IS_CVDT AS "isCvdt",
                        CB.IS_HDTN AS "isHdtn",
                        CB.HOC_VI_NOI_TOT_NGHIEP AS "hocViNoiTotNghiep",
                        CB.TRINH_DO_PHO_THONG AS "trinhDoPhoThong",
                        CB.HE_SO_LUONG AS "heSoLuong",
                        CB.BAC_LUONG AS "bacLuong",
                        CB.MOC_NANG_LUONG AS "mocNangLuong",
                        CB.TY_LE_VUOT_KHUNG AS "tyLeVuotKhung",
                        CB.CMND AS "cmnd",
                        CB.CMND_NGAY_CAP AS "cmndNgayCap",
                        CB.CMND_NOI_CAP AS "cmndNoiCap",
                        CB.DANH_HIEU AS "danhHieu",
                        CB.DANG_VIEN AS "dangVien",
                        CB.GHI_CHU AS "ghiChu",
                        (SELECT DMCV.TEN
                         FROM QT_CHUC_VU QTCV
                                  LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "chucVuChinh",

                        (SELECT QTCV.MA_CHUC_VU
                         FROM QT_CHUC_VU QTCV
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "maChucVuChinh",

                        (SELECT QTCV.NGAY_RA_QD
                         FROM QT_CHUC_VU QTCV
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "boNhiemNgay",

                        (SELECT DMCV.PHU_CAP
                         FROM QT_CHUC_VU QTCV
                                  LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "phuCapChucVu",
                        (CASE
                             WHEN CB.NGAY_BIEN_CHE IS NULL THEN 'Hợp đồng'
                             ELSE 'Biên chế'
                            END)                 AS "loaiCanBo",
                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by null).getclobval(), '-')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(CB.HOC_VI_NOI_TOT_NGHIEP, dmqg.MA_CODE) != 0
                        ) AS "danhSahcQuocGiaHocViNoiTotNghiep",
--                         (CASE
--                              WHEN CB.TIEN_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                   FROM QT_DAO_TAO qtdt
--                                   WHERE qtdt.SHCC = CB.SHCC
--                                     AND qtdt.TRINH_DO = '4' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatTienSi",
--                         (CASE WHEN CB.THAC_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                    FROM QT_DAO_TAO qtdt
--                                    WHERE qtdt.SHCC = CB.SHCC AND qtdt.TRINH_DO = '3' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatThacSi",

                        CB.NGAY_SINH              AS        "ngaySinh",
                        CB.EMAIL                  AS        "email",

                        dmDanToc.MA AS "maDanToc",
                        dmDanToc.TEN AS "tenDanToc",

                        dmTonGiao.MA AS "maTonGiao",
                        dmTonGiao.TEN AS "tenTonGiao",

                        ROW_NUMBER() OVER (ORDER BY CB.TEN) R
                 FROM TCHC_CAN_BO CB
                          LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
                          LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
                          LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
                          LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
                         LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
                         LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.TON_GIAO = dmTonGiao.MA

                WHERE (
                        ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                            OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level) from dual connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                            OR (listShcc IS NULL AND listDonVi IS NULL))
                        AND (gender IS NULL OR gender IS NOT NULL AND CB.PHAI = gender)
                        AND (listNgach IS NULL OR
                             listNgach IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listNgach, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(listNgach, '[^,]+', 1, level) is not null))
                        AND (listHocVi IS NULL OR
                             listHocVi IS NOT NULL AND CB.HOC_VI IN (SELECT regexp_substr(listHocVi, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listHocVi, '[^,]+', 1, level) is not null))
                        AND (listChucDanh IS NULL OR
                             listChucDanh IS NOT NULL AND CB.CHUC_DANH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                                           from dual
                                                                           connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null))
                        AND (isBienChe IS NULL OR
                             (isBienChe = 0 AND NGAY_BIEN_CHE IS NOT NULL) OR
                             (isBienChe = 1 AND NGAY_BIEN_CHE IS NULL)
                            )
                        AND (fromYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC >= fromYear))
                        AND (toYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC <= toYear))
                        AND (listDanToc IS NULL OR (CB.DAN_TOC IN (SELECT regexp_substr(listDanToc, '[^,]+', 1, level) from dual connect by regexp_substr(listDanToc, '[^,]+', 1, level) is not null)))
                        AND (listTonGiao IS NULL OR (CB.TON_GIAO IN (SELECT regexp_substr(listTonGiao, '[^,]+', 1, level) from dual connect by regexp_substr(listTonGiao, '[^,]+', 1, level) is not null)))
                        AND (listQuocGia IS NULL OR (CB.HOC_VI_NOI_TOT_NGHIEP IS NOT NULL AND
                            EXISTS(
                                SELECT regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) from dual connect by regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) is not null
                                INTERSECT
                                SELECT regexp_substr(listQuocGia, '[^,]+', 1, level) from dual connect by regexp_substr(listQuocGia, '[^,]+', 1, level) is not null
                                )
                            ))
                        AND (loaiHopDong IS NULL OR CB.IS_HDTN = loaiHopDong)
                        AND (loaiChuyenVien IS NULL OR CB.IS_CVDT = loaiChuyenVien)
                        AND (fromAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate), (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH from dual)) / 12) from dual) >= fromAge))
                        AND (toAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate), (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH from dual)) / 12) from dual) <= toAge))
                        AND (listChuyenNganh IS NULL OR (CB.CHUYEN_NGANH IN (SELECT regexp_substr(listChuyenNganh, '[^,]+', 1, level) from dual connect by regexp_substr(listChuyenNganh, '[^,]+', 1, level) is not null)))
                    )
                  AND (NGAY_NGHI IS NULL)
                  AND (searchTerm = ''
                    OR LOWER(CB.SHCC) LIKE ST
                    OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
                    OR LOWER(CB.EMAIL) LIKE ST
                    OR LOWER(CB.CHUYEN_NGANH) LIKE ST
                    OR LOWER(CB.DANH_HIEU) LIKE ST
                    OR LOWER(CB.GHI_CHU) LIKE ST)
                 ORDER BY CB.TEN
             );
    RETURN canbosys;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_SUPPORT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                         searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    TCCB_SP    SYS_REFCURSOR;
    ST         STRING(500) := '%' || lower(searchTerm) || '%';
    TYPE_QUERY STRING(10);
    SHCC_QUERY STRING(10);
BEGIN
    SELECT JSON_VALUE(filter, '$.type') INTO TYPE_QUERY FROM DUAL;
    SELECT JSON_VALUE(filter, '$.shcc') INTO SHCC_QUERY FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TCCB_SUPPORT SP
             LEFT JOIN TCHC_CAN_BO CB_YEUCAU ON CB_YEUCAU.SHCC = SP.SHCC
             LEFT JOIN TCHC_CAN_BO CB_XULY ON CB_XULY.SHCC = SP.SHCC_ASSIGN

    WHERE (SHCC_QUERY IS NULL OR SHCC_QUERY = '' OR SHCC_QUERY = CB_YEUCAU.SHCC) AND
          (TYPE_QUERY IS NULL OR
           TYPE_QUERY IS NOT NULL AND SP.TYPE IN (SELECT regexp_substr(TYPE_QUERY, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(TYPE_QUERY, '[^,]+', 1, level) is not null))
      AND (searchTerm = ''
        OR LOWER(CB_YEUCAU.SHCC) LIKE ST
        OR LOWER(TRIM(CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN TCCB_SP FOR
        SELECT *
        FROM (SELECT SP.ID                                AS                    "id",
                     SP.TYPE                              AS                    "type",
                     SP.SHCC                              AS                    "shcc",
                     SP.SHCC_ASSIGN                       AS                    "shccAssign",
                     SP.DATA                              AS                    "data",
                     SP.APPROVED                          AS                    "approved",
                     SP.MODIFIED_DATE                     as                    "modifiedDate",
                     SP.QT                                as                    "qt",
                     SP.QT_ID                             AS                    "qtId",
                     SP.SENT_DATE                         AS                    "sentDate",
                     CB_XULY.HO || ' ' || CB_XULY.TEN     as                    "canBoXuLy",
                     CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN as                    "canBoYeuCau",

                     ROW_NUMBER() OVER (ORDER BY SP.SENT_DATE DESC) R
              FROM TCCB_SUPPORT SP
                       LEFT JOIN TCHC_CAN_BO CB_YEUCAU ON CB_YEUCAU.SHCC = SP.SHCC
                       LEFT JOIN TCHC_CAN_BO CB_XULY ON CB_XULY.SHCC = SP.SHCC_ASSIGN

              WHERE (SHCC_QUERY IS NULL OR SHCC_QUERY = '' OR SHCC_QUERY = CB_YEUCAU.SHCC) AND
                    (TYPE_QUERY IS NULL OR
                     TYPE_QUERY IS NOT NULL AND SP.TYPE IN (SELECT regexp_substr(TYPE_QUERY, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(TYPE_QUERY, '[^,]+', 1, level) is not null))
                AND (searchTerm = ''
                  OR LOWER(CB_YEUCAU.SHCC) LIKE ST
                  OR LOWER(TRIM(CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN)) LIKE ST));
    RETURN TCCB_SP;

end;

/
--EndMethod--

